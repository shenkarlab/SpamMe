 $(function () {
            var data = [
            {
                label: 'Amotions',
                value: null,
                color: '#325791'
            },
            {
                label: 'Life-Style',
                value: null,
                color: '#B3FAFF'
            },
            {
                label: 'Commerce',
                value: null,
                color: '#95FF7A'
            },
            {
                label: 'Financial',
                value: null,
                color: '#FFA3CE'
            },
            {
                label: 'Advertising',
                value: null,
                color: '#F1A3FF'
            },
            {
                label: 'Happy',
                value: 5,
                parent: 'Amotions',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'Greeting',
                value: 10,
                parent: 'Amotions',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'Pressure',
                value: 1,
                parent: 'Amotions',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'Success',
                value: 2,
                parent: 'Amotions',
                data: { description: "1 Emails", title: "Commerce#Hi-tech" }
            },
            {
                label: 'Family',
                value: 4,
                parent: 'Life-Style',
                data: { description: "4 Emails", title: "Life-Style#Family" }
            },
            {
                label: 'Offers',
                value: 5,
                parent: 'Commerce',
                data: { description: "5 Emails", title: "Commerce#Offers" }
            },
            {
                label: 'Sells',
                value: 4,
                parent: 'Commerce',
                data: { description: "4 Emails5 Emails", title: "Commerce#Sells" }
            },
            {
                label: 'Hi-tech',
                value: 1,
                parent: 'Commerce',
                data: { description: "1 Emails", title: "Commerce#Hi-tech" }
            },
            {
                label: 'buy',
                value: 1,
                parent: 'Commerce',
                data: { description: "1 Emails", title: "Commerce#Buy" }
            },
            {
                label: 'marketing',
                value: 5,
                parent: 'Advertising',
                data: { description: "5 Emails", title: "Advertising#Marketing" }
            },
            {
                label: 'Discounts',
                value: 1,
                parent: 'Advertising',
                data: { description: "1 Emails", title: "Advertising#Discounts" }
            },
            {
                label: 'Personal',
                value: 4,
                parent: 'Financial',
                data: { description: "4 Emails", title: "Financial#Personal" }
            }
            
            ];
  
            

            $('#treemap').jqxTreeMap({
                height: 300,
                source: data,
                colorRange: 1
            });
        });