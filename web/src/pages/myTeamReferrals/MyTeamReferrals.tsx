import React, { useState } from "react";
import {
    Container,
    Text,
    TextInput,
    Pagination,
    Loader,
    Center,
    Avatar,
    Badge,
    Box,
    Tabs,
} from "@mantine/core";
import { FiSearch, FiUsers, FiAward, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { useMyTeamReferralsQuery } from "../../hooks/query/team.query";
import classes from "./MyTeamReferrals.module.scss";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const MyTeamReferrals: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 12;

    const { data: referralsData, isLoading } = useMyTeamReferralsQuery({
        page: activePage,
        limit: itemsPerPage,
        search: searchQuery,
        level: selectedLevel !== "all" ? selectedLevel : undefined,
    });

    const referrals = referralsData?.referrals || [];
    const pagination = referralsData?.pagination || {};

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getLevelBadgeColor = (level: string) => {
        const colors: any = {
            A: "red",
            B: "blue",
            C: "grape",
        };
        return colors[level] || "gray";
    };

    const totalMembers = pagination.totalCount || 0;
    const levelACount = referrals.filter((r: any) => r.level === "A").length;
    const levelBCount = referrals.filter((r: any) => r.level === "B").length;
    const levelCCount = referrals.filter((r: any) => r.level === "C").length;

    return (
        <Box className={classes.pageContainer}>
            <CommonHeader heading="Total Team Member" />
            <Container size="xl" mt="lg">

                <Box className={classes.statsGrid}>
                    <Box className={classes.statCard}>
                        <Text className={classes.statLabel}>Total</Text>
                        <Text className={classes.statValue}>{totalMembers}</Text>
                    </Box>
                    <Box className={`${classes.statCard} ${classes.statA}`}>
                        <Text className={classes.statLabel}>Level A</Text>
                        <Text className={classes.statValue}>{levelACount}</Text>
                    </Box>
                    <Box className={`${classes.statCard} ${classes.statB}`}>
                        <Text className={classes.statLabel}>Level B</Text>
                        <Text className={classes.statValue}>{levelBCount}</Text>
                    </Box>
                    <Box className={`${classes.statCard} ${classes.statC}`}>
                        <Text className={classes.statLabel}>Level C</Text>
                        <Text className={classes.statValue}>{levelCCount}</Text>
                    </Box>
                </Box>

                <Box className={classes.filterCard}>
                    <Tabs
                        value={selectedLevel}
                        onChange={(value) => {
                            setSelectedLevel(value || "all");
                            setActivePage(1);
                        }}
                        color="#2d1b4e"
                        classNames={{
                            root: classes.tabsRoot,
                            list: classes.tabsList,
                            tab: classes.tab,
                        }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="all" leftSection={<FiUsers size={14} />}>
                                All
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="A"
                                className={classes.tabA}
                                leftSection={<FiAward size={14} />}
                            >
                                Level A
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="B"
                                className={classes.tabB}
                                leftSection={<FiTrendingUp size={14} />}
                            >
                                Level B
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="C"
                                className={classes.tabC}
                                leftSection={<FiUserCheck size={14} />}
                            >
                                Level C
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>

                    <TextInput
                        placeholder="Search by name or phone..."
                        leftSection={<FiSearch size={14} />}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setActivePage(1);
                        }}
                        size="sm"
                        className={classes.searchInput}
                    />
                </Box>

                {isLoading && (
                    <Center py="xl">
                        <Loader size="lg" />
                    </Center>
                )}

                {!isLoading && referrals.length === 0 && (
                    <Box className={classes.emptyState}>
                        <FaUsers className={classes.emptyIcon} />
                        <Text size="lg" fw={600} c="dark">
                            No Team Members Found
                        </Text>
                        <Text size="sm" c="dimmed" mt={4}>
                            {searchQuery
                                ? "Try adjusting your search or filters"
                                : "Start building your team by sharing your referral link"}
                        </Text>
                    </Box>
                )}

                {!isLoading && referrals.length > 0 && (
                    <Box className={classes.tableContainer}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Phone</th>
                                    <th>Level</th>
                                    <th>Joined</th>
                                    <th>Investment</th>
                                    <th>Current Level</th>
                                    <th>Chain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((referral: any) => (
                                    <tr
                                        key={referral._id}
                                        className={classes.tableRow}
                                    >
                                        <td>
                                            <Box className={classes.memberCell}>
                                                <Avatar
                                                    src={referral.referredUser?.picture}
                                                    size={36}
                                                    radius="xl"
                                                    className={classes.avatar}
                                                >
                                                    {referral.referredUser?.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </Avatar>
                                                <Text className={classes.memberName}>
                                                    {referral.referredUser?.name}
                                                </Text>
                                            </Box>
                                        </td>
                                        <td>
                                            <Text className={classes.phoneText}>
                                                {referral.referredUser?.phone}
                                            </Text>
                                        </td>
                                        <td>
                                            <Badge
                                                color={getLevelBadgeColor(referral.level)}
                                                size="sm"
                                                variant="light"
                                            >
                                                {referral.level}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Text className={classes.dateText}>
                                                {formatDate(referral.referredUser?.joinedAt)}
                                            </Text>
                                        </td>
                                        <td>
                                            <Text className={classes.amountText}>
                                                ₹{referral.referredUser?.investmentAmount || 0}
                                            </Text>
                                        </td>
                                        <td>
                                            <Text className={classes.levelText}>
                                                {referral.referredUser?.currentLevel || "-"}
                                            </Text>
                                        </td>
                                        <td>
                                            <Text className={classes.chainText}>
                                                {referral.referralChainLength}
                                            </Text>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 1 && (
                    <Center mt="xl">
                        <Pagination
                            value={activePage}
                            onChange={setActivePage}
                            total={pagination.totalPages}
                            size="sm"
                        />
                    </Center>
                )}
            </Container>
        </Box>
    );
};

export default MyTeamReferrals;