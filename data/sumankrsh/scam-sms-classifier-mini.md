# sumankrsh/scam-sms-classifier-mini

## Resumen

`scam-sms-classifier-mini` es un clasificador de texto binario desarrollado por Suman Mukherjee que asigna una puntuación entre 0 y 1 a mensajes cortos (SMS, WhatsApp, correo electrónico) indicando su probabilidad de ser spam o una estafa. No es un modelo de lenguaje neuronal: se trata de un pipeline clásico de scikit-learn basado en TF-IDF con n-gramas de palabra y de carácter, combinado con regresión logística, entrenado en CPU y exportado a un fichero JSON de 128 KB para poder ejecutarse en JavaScript directamente en el navegador.

El modelo forma parte del Space "Is this message a scam?", donde se combina con reglas heurísticas escritas a mano y explicables. Su función es actuar como una segunda opinión sobre un mensaje concreto: una puntuación igual o superior a 0,46 añade 2 puntos al resultado de las reglas, pudiendo elevar la clasificación de "sin señales comunes de estafa" a "ten cuidado" o de "ten cuidado" a "parece una estafa", pero nunca rebajando el veredicto de las reglas.

Es relevante por su enfoque reproducible y honesto: evaluación única sobre un conjunto de test reservado, separación de plantillas sintéticas entre particiones para evitar fuga de información y una implementación JavaScript que replica las probabilidades de scikit-learn con un error máximo de 0,0000026. Está pensado como demostración y material didáctico, no como sistema de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TF-IDF (n-gramas de palabra y carácter) + regresión logística |
| Parámetros totales | no disponible (modelo lineal; tamaño del artefacto exportado: 128 KB en JSON) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de mensajes cortos; sin ventana definida) |
| Tipos de cuantización | no aplica (modelo lineal en coma flotante; exportación a JSON) |
| Idiomas soportados | inglés (incluye algunas plantillas en hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (exportación propia para ejecución en JavaScript); modelo entrenado con scikit-learn |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clásico: vectorización TF-IDF con n-gramas de palabra y de carácter seguida de regresión logística, entrenado con scikit-learn en CPU. El artefacto final se exporta a un JSON de 128 KB que se ejecuta en JavaScript en el navegador mediante el puerto `js/scam_model.js`, que reproduce las probabilidades de scikit-learn con una desviación máxima de 0,0000026 sobre las 1.493 muestras de validación.

Los datos de entrenamiento combinan dos fuentes. Por un lado, el SMS Spam Collection de UCI (Almeida y Gómez Hidalgo, CC BY 4.0, doi:10.24432/C5CC84), con 5.574 SMS en inglés, de los cuales aproximadamente el 87 % son "ham" (mayoritariamente del NUS SMS Corpus de Singapur) y el 13 % "spam" (principalmente del Reino Unido, hacia 2012); el script `train.py` descarga el dataset, verifica el SHA-256 del zip, elimina 415 textos duplicados y realiza una partición estratificada 60/20/20 con semilla 20261114. Por otro lado, 2.057 mensajes sintéticos con estilo de la India (1.124 de estafa y 933 genuinos), generados a partir de 208 plantillas en 23 categorías con semilla fija; las plantillas, no los mensajes, se asignan a las particiones, de modo que validación y test usan formulaciones nunca vistas en entrenamiento. Las particiones resultantes son: entrenamiento con 4.255 mensajes (982 spam/estafa; 3.095 de UCI y 1.160 sintéticos), validación con 1.493 (407 spam/estafa) y test reservado con 1.468 (377 spam/estafa).

La selección de hiperparámetros (tamaños de vocabulario, C y pesos de clase por average precision, prefiriendo la configuración más simple dentro de 0,003 del mejor resultado; umbral de 0,46 por F1) se realizó únicamente sobre validación. El conjunto reservado se evaluó una sola vez con `evaluate.mjs`, usando el mismo JavaScript que ejecuta la página web.

## Capacidades

- Clasificación binaria de texto corto: asigna una puntuación de 0 a 1 indicando probabilidad de spam o estafa.
- Detección de spam genérico en inglés (promociones, ofertas de tonos, servicios de citas) heredada del corpus UCI.
- Detección de patrones de estafa propios del contexto indio: actualizaciones de KYC/PAN/Aadhaar, solicitudes de OTP, UPI con "introduce el PIN para recibir", premios y loterías, tasas de paquetería y aduanas, cortes de electricidad, "detención digital" y amenazas policiales, ofertas de trabajo por tareas, grupos de inversión y criptomonedas, reembolsos y dinero "enviado por error", APK y aplicaciones de compartir pantalla, familiares con "número nuevo" y comisiones de préstamos.
- Reconocimiento de mensajes genuinos: OTP que indican "no compartir", alertas bancarias, entregas, facturas, citas, conversaciones, mensajes de trabajo, avisos de servicio bancario y de aseguradoras.
- Soporte parcial de hinglish en las plantillas sintéticas.
- Ejecución en navegador sin dependencias de servidor gracias a la exportación a JSON.
- Integración con reglas heurísticas explicables en el Space, donde la puntuación del modelo solo puede elevar el veredicto de las reglas, nunca rebajarlo.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Segunda opinión para usuarios finales: una persona pega un SMS o mensaje de WhatsApp sospechoso en el Space y recibe una puntuación combinada con reglas explicables; el modelo aporta la señal estadística y las reglas aportan la justificación legible.
- Material didáctico sobre clasificación de texto: el repositorio incluye scripts de descarga, verificación de integridad, generación sintética, entrenamiento y evaluación, lo que permite reproducir el pipeline completo de extremo a extremo en CPU.
- Demostración de despliegue en navegador: el JSON de 128 KB y el puerto JavaScript permiten mostrar cómo llevar un modelo de scikit-learn a un entorno sin backend, útil en cursos de ML aplicado.
- Investigación sobre evaluación honesta: la separación de plantillas sintéticas entre particiones y la evaluación única sobre test reservado sirven como ejemplo de buenas prácticas para evitar fuga de información en datasets aumentados.
- Filtrado de primera pasada en prototipos de mensajería: en un entorno controlado y con revisión humana posterior, podría señalizar mensajes para revisión manual, nunca para bloqueo automático.
- Estudio de sesgos de dominio: el modelo ilustra cómo un clasificador entrenado con spam de 2012 del Reino Unido sobrerrespuesta ante palabras como "free", "call", "claim" o "pay" en mensajes legítimos de otros contextos, útil para analizar transferencia entre dominios.
- Generación de datasets sintéticos etiquetados: el script `generate_synthetic.py` con 208 plantillas en 23 categorías y entidades ficticias (dominios `*.example`, rangos IP de documentación, teléfonos 00000) puede reutilizarse como base para otros experimentos de detección de fraude.

## Benchmarks y rendimiento

Resultados sobre el conjunto reservado completo (1.468 mensajes: 377 spam o estafa, 1.091 genuinos), evaluado una sola vez:

| Método | Precisión | Recall | F1 | Spam/estafa marcados | Genuinos marcados |
|---|---|---|---|---|---|
| Solo reglas | 99,6 % | 72,9 % | 84,2 % | 275 de 377 | 1 de 1.091 |
| Solo modelo (puntuación ≥ 0,46) | 92,7 % | 97,9 % | 95,2 % | 369 de 377 | 29 de 1.091 |
| Reglas + modelo (el Space) | 92,5 % | 98,4 % | 95,4 % | 371 de 377 | 30 de 1.091 |

Desglose por procedencia de los datos (test reservado):

| Parte | Método | Precisión | Recall | F1 | Marcados | Genuinos marcados |
|---|---|---|---|---|---|---|
| UCI, 1.032 SMS reales | Solo modelo | 99,2 % | 95,3 % | 97,2 % | 122 de 128 | 1 de 904 |
| UCI | Reglas + modelo | 98,4 % | 95,3 % | 96,8 % | 122 de 128 | 2 de 904 |
| Sintético, 436 mensajes | Solo modelo | 89,8 % | 99,2 % | 94,3 % | 247 de 249 | 28 de 187 |
| Sintético | Reglas + modelo | 89,9 % | 100,0 % | 94,7 % | 249 de 249 | 28 de 187 |

Resultados de validación (usados para ajuste, por tanto optimistas): solo modelo, precisión 98,7 %, recall 93,4 %, F1 96,0 %.

El análisis del autor señala que el modelo funciona bien sobre el spam que aprendió (UCI), pero sobre formulaciones sintéticas nuevas marca como spam-like 12 de 16 conversaciones amistosas y 12 de 24 confirmaciones de reembolso o reclamación, porque palabras como "free", "call", "claim" y "pay" son frecuentes en el spam de UCI. En el Space esos 28 mensajes reciben "ten cuidado", nunca "parece una estafa".

## Requisitos de hardware

- Inferencia en CPU: el modelo es un clasificador lineal; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU de consumo: sí, pero no es necesario; también se ejecuta en el navegador.
- Artefacto desplegable: fichero JSON de 128 KB; ejecutable en JavaScript sin servidor.
- Opciones de despliegue: navegador web (JavaScript), Python con scikit-learn, o cualquier entorno capaz de cargar el JSON y aplicar la función logística.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (producto escalar sobre TF-IDF disperso) se espera latencia de microsegundos a milisegundos por mensaje en CPU, aunque no se han publicado cifras.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la información disponible, por lo que no es posible establecer una comparativa cuantitativa fiable con otros clasificadores de spam o estafa.

| Modelo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| scam-sms-classifier-mini | TF-IDF + regresión logística | no aplica | Apache 2.0 | Hugging Face (JSON, scikit-learn) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo pequeño y parcialmente sintético: el test reservado tiene 1.468 mensajes, de los cuales 436 son sintéticos; las conclusiones sobre generalización son limitadas.
- Sesgo de dominio: entrenado con spam de UCI (mayoritariamente del Reino Unido, hacia 2012), marca como spam-like mensajes legítimos que contienen palabras como "free", "call", "claim" o "pay"; en el test sintético marcó 28 de 187 mensajes genuinos.
- No distingue entre spam comercial y estafa: el "spam" de UCI incluye promociones ordinarias, ofertas de tonos y servicios de citas, no solo fraude.
- Riesgo de falsos positivos en conversaciones amistosas (12 de 16 en el test sintético) y en confirmaciones de reembolso o reclamación (12 de 24).
- Cobertura lingüística limitada al inglés, con presencia puntual de hinglish en las plantillas sintéticas; no soporta otros idiomas.
- Uso previsto restringido: no debe emplearse para bloquear o eliminar mensajes automáticamente, juzgar a personas, decidir reclamaciones, pagos o acciones sobre cuentas, ni en ningún escenario donde un error perjudique a alguien sin revisión humana.
- No debe describirse una puntuación baja como "seguro".
- Entidades ficticias en los datos sintéticos (bancos, tiendas, dominios `*.example`, rangos IP de documentación, teléfonos 00000): no reflejan entidades reales y pueden no cubrir patrones de fraude actuales.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente el uso en producción para decisiones automatizadas.
- Sin garantías de calibración fuera del dominio de entrenamiento; el umbral 0,46 está ajustado sobre validación y puede no transferir a otras distribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumankrsh/scam-sms-classifier-mini
- Space "Is this message a scam?": https://huggingface.co/spaces/sumankrsh/scam-message-checker
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/sumanmukherjee91k
- Dataset SMS Spam Collection (UCI): https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- DOI del dataset UCI: https://doi.org/10.24432/C5CC84
- Dataset en Hugging Face: https://huggingface.co/datasets/ucirvine/sms_spam
