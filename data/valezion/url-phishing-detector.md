# valezion/url-phishing-detector

## Resumen

El detector de phishing de URL de valezion es un modelo de clasificación supervisada que decide si una cadena de URL es maliciosa usando únicamente el texto del enlace. No realiza peticiones de red, no descarga la página ni consulta servicios externos: la decisión se toma antes de que nadie haga clic, por lo que encaja en filtros de correo, formularios web o campos de URL dentro de un CMS. Se distribuye como un `StackingClassifier` de scikit-learn 1.7.2 (entrenado en CPU) acompañado de código de extracción de características y un vocabulario empaquetado, con licencia MIT.

El modelo combina una regresión logística sobre n-gramas de caracteres (3–5, `char_wb`) de la URL completa con un `HistGradientBoosting` sobre 62 características calculadas: longitudes, número de subdominios, dígitos, entropía, presencia de marcas conocidas en un hostname ajeno, proveedores de hosting compartido, vocabulario de páginas de login en cinco idiomas y dos medidas de legibilidad del dominio. Se entrenó con 260.000 URL (mitad phishing activo, mitad web benigna) repartidas en unos 195.000 dominios.

Su relevancia es doble. Por un lado, ofrece un punto de operación ajustable con ROC-AUC de 0,948 sobre un holdout independiente construido el mismo día (phishing verificado de OpenPhish frente a enlaces publicados ese día en Hacker News y lobste.rs), sin dominios en común con el entrenamiento. Por otro, documenta explícitamente el sesgo de dataset del que adolece la literatura del área (el dataset PhiUSIIL, muy citado, es inservible porque separa clases por longitud) y excluye deliberadamente el esquema `http`/`https`, la barra final y el prefijo `www.` para no aprender de qué lista proviene cada URL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `StackingClassifier` de scikit-learn sobre dos modelos base: regresión logística con n-gramas de caracteres (3–5, `char_wb`) y `HistGradientBoosting` sobre 62 características tabulares calculadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación sobre una cadena de URL, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante; artefacto `joblib` de scikit-learn) |
| Idiomas soportados | etiquetados como `en` e `it`; datos de entrenamiento multilingües en inglés, italiano, alemán, francés y español |
| Licencia | MIT |
| Formato de pesos | `joblib` (`model.joblib`), más `thresholds.json` y código Python de características (`features.py`) y vocabulario |

Datos adicionales de la ficha de HuggingFace: pipeline `text-classification`, librería `sklearn`, 0 descargas, 0 likes, tamaño de repositorio 0,0 GB (menos de 0,1 GB), creado y actualizado el 23 de septiembre de 2026, autor `valezion`.

## Arquitectura y entrenamiento

La arquitectura es un apilado (stacking) de dos estimadores clásicos, no una red neuronal. El primer modelo base es una regresión logística que consume n-gramas de caracteres de rango 3–5 con límites de palabra (`char_wb`) sobre la URL completa, lo que captura patrones léxicos como cadenas de subdominios anómalas o tokens de marca incrustados. El segundo es un `HistGradientBoosting` que trabaja sobre 62 características derivadas: longitudes y recuentos, número de subdominios, proporción de dígitos, entropía, detección de una marca conocida en un hostname que no es su dominio legítimo, presencia de proveedores de hosting compartido, vocabulario de páginas de login en cinco idiomas y dos métricas de pronunciabilidad del dominio (cobertura de palabras de diccionario y plausibilidad de bigramas de caracteres). El clasificador de nivel superior combina las salidas de ambos.

El entrenamiento usó 260.000 URL, la mitad phishing en vivo y la mitad web benigna, distribuidas en aproximadamente 195.000 dominios. No hay dataset preempaquetado: el phishing proviene de la lista ACTIVE de Phishing.Database y los ejemplos benignos de enlaces externos de Wikipedia (inglés, italiano, alemán, francés y español, consultados TLD por TLD), sitemaps de sitios listados en Tranco, páginas de inicio de Tranco muestreadas a lo largo de todo el ranking y 3.941 páginas de login reales verificadas con HTTP 200. OpenPhish y las fuentes del holdout de enlaces benignos se reservaron por completo para evaluación. La decisión de diseño más destacable es la exclusión deliberada del esquema, la barra final y el prefijo `www.`: en datasets ensamblados a partir de feeds públicos esas variables codifican la lista de origen, no el riesgo, y su inclusión produce buenas métricas en papel y un modelo inútil en producción.

## Capacidades

- Clasificación binaria de URL (phishing frente a benigna) a partir exclusivamente de la cadena, sin tráfico de red ni resolución DNS.
- Puntuación continua por URL mediante `model.predict_proba(...)[:, 1]`, pensada para ranking y umbralización, no como probabilidad calibrada.
- Detección de marcas conocidas alojadas en dominios ajenos (por ejemplo, una marca en un subdominio bajo un dominio que no le pertenece).
- Reconocimiento de vocabulario de páginas de login en cinco idiomas, aunque las etiquetas declaradas del modelo sean `en` e `it`.
- Transferencia a otra amenaza no vista en entrenamiento: en el test con 13.427 URL de malware de URLhaus detecta entre el 91,1% y el 97,3% según el umbral elegido.
- Punto de operación configurable mediante `thresholds.json`, con dos referencias medidas en el test interno por dominio: `threshold_fpr1` (≈1% de falsos positivos) y `threshold_fpr01` (≈0,1%).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador tabular/textual de una sola pasada.

## Casos de uso

- Triage de listas masivas de URL: el modelo puntúa grandes volúmenes de enlaces por cadena, sin coste de red, para priorizar cuáles revisar manualmente o enviar a un analista. Es su uso declarado como señal de primera etapa dentro de un sistema mayor.
- Filtro previo en pasarelas de correo: situado antes del sandbox o del análisis de contenido, permite descartar o marcar enlaces sospechosos antes de que el usuario haga clic, con el umbral ajustado al coste de bloquear un enlace legítimo (por ejemplo, 0,90% de falsos positivos para capturar el 53,4% del phishing fresco del holdout).
- Validación en formularios y CMS: al puntuar la cadena, puede evaluar un campo de URL en el momento de la escritura, en comentarios o en publicaciones de usuario, sin introducir latencia de red en la petición.
- Enriquecimiento en SIEM/SOAR: puntuar las URL extraídas de logs de proxy, correo o endpoint para añadir una señal de riesgo a cada alerta y ordenar la cola de incidentes.
- Investigación de amenazas y threat hunting: clasificar rápidamente feeds o volcados de enlaces y separar candidatos antes de un análisis más costoso, usando el ranking y no la puntuación absoluta.
- Detección complementaria de malware: aprovechar la transferencia medida sobre URLhaus (91,1%–97,3% de detección) para marcar enlaces de distribución de malware, asumiendo que es un dominio distinto del entrenado.
- Educación e investigación sobre sesgo de dataset: el repositorio incluye `DIARY.md`, con ocho episodios en los que el modelo aprendió algo ajeno al phishing y cómo se detectó, material útil para enseñar fugas de datos y sesgos de recolección.
- Segunda opinión en herramientas de seguridad existentes: usar la puntuación como señal adicional junto a reputación de dominio y certificados, nunca como única puerta, dado que el propio autor lo describe como complemento y no como producto de seguridad.

## Benchmarks y rendimiento

Resultados de ROC-AUC publicados en la model card:

| Conjunto de test | ROC-AUC |
|---|---|
| Split aleatorio | 0,989 |
| Split por dominio (ningún dominio compartido entre entrenamiento y test) | 0,987 |
| Holdout independiente (phishing verificado del día frente a enlaces publicados ese día) | 0,948 |

Puntos de operación sobre el holdout independiente, con 2.210 enlaces benignos (Hacker News y lobste.rs del mismo día) y 193 URL de phishing verificado (OpenPhish del mismo día), sin dominios en común con el entrenamiento:

| Enlaces buenos bloqueados | Phishing fresco detectado | Umbral | Malware de URLhaus detectado |
|---|---|---|---|
| 0,50% | 45,6% | 0,984 | 91,1% |
| 0,90% | 53,4% | 0,977 | 92,8% |
| 1,99% | 62,7% | 0,958 | 94,3% |
| 4,89% | 78,2% | 0,844 | 96,3% |
| 9,86% | 86,0% | 0,542 | 97,3% |

El autor advierte de que, con solo 193 positivos, el 53,4% de detección lleva un intervalo bootstrap del 95% de 46,6–60,6%: es una estimación honesta, no una medida precisa. La columna de URLhaus corresponde a un test de transferencia con 13.427 URL de malware, una amenaza distinta nunca vista en entrenamiento. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el modelo se entrenó con scikit-learn 1.7.2 en CPU y no requiere GPU. VRAM estimada: 0 GB.
- No necesita acelerador alguno; funciona en cualquier máquina que ejecute Python con scikit-learn 1.7.2 y `joblib`.
- Cabe holgadamente en cualquier equipo de consumo, incluidos portátiles sin GPU dedicada, dado que el repositorio ocupa menos de 0,1 GB y el artefacto es un modelo clásico.
- Opciones de despliegue: ejecución directa en Python con `joblib.load` más el módulo `features.py` y el vocabulario empaquetado, descargados con `snapshot_download` de `huggingface_hub`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que sirven modelos de pesos neuronales.
- Sin dependencia de red en inferencia: no hay consultas DNS, HTTP ni a servicios de reputación, lo que simplifica el despliegue en entornos aislados.
- RAM necesaria, latencia por URL y throughput estimado: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de cifras comparables publicadas en la información proporcionada. La categoría es la de clasificadores de URL por cadena, y las alternativas habituales son servicios de reputación (Google Safe Browsing, PhishTank, URLhaus) que operan con listas, consultas de red y señales externas como edad del dominio, certificado o reputación de IP, por lo que no son equivalentes en entrada ni en condiciones de medida.

| Modelo o servicio | Enfoque | Señales de entrada | Necesita red en inferencia | Licencia |
|---|---|---|---|---|
| valezion/url-phishing-detector | Stacking de regresión logística + HistGradientBoosting | Solo la cadena de URL y 62 características derivadas | No | MIT |
| Servicios de reputación tipo Google Safe Browsing, PhishTank o URLhaus | Listas y consultas de reputación | Reputación de dominio, IP, certificado, listas de feeds | Sí | Propietaria o términos de uso propios |
| Modelos entrenados sobre PhiUSIIL u otros datasets académicos | Aprendizaje supervisado sobre dataset público | Variable; el autor documenta que en PhiUSIIL la longitud separa las clases | No | Según dataset |

Cifras de parámetros, contexto y rendimiento de estas alternativas: no disponibles.

## Limitaciones y advertencias

- No es un producto de seguridad ni sustituye a uno; el propio autor lo indica y desaconseja usarlo como única barrera en decisiones que importen.
- Punto ciego estructural: es ciego al phishing alojado en sitios legítimos comprometidos, donde la cadena no contiene evidencia alguna. Es el techo del problema, no del modelo.
- Una puntuación baja nunca garantiza que un enlace sea seguro.
- El diccionario de las dos medidas de legibilidad es inglés, así que los dominios en otros idiomas parten con desventaja, aunque los datos de entrenamiento sean multilingües (inglés, italiano, alemán, francés y español).
- No usa señales de reputación (edad del dominio, certificado, reputación de IP); incorporarlas mejoraría sustancialmente el resultado.
- Falso positivo conocido: `accounts.google.com/signin` sigue puntuando como phishing. La corrección pasaría por incluir más páginas de login de grandes proveedores entre los ejemplos benignos.
- Envejece: el phishing cambia y los feeds se actualizan a diario. Un modelo congelado en septiembre de 2026 se degrada, aunque el repositorio incluye todo lo necesario para reentrenarlo.
- Las puntuaciones no son probabilidades calibradas: están muy concentradas cerca de 0 y 1. Deben usarse para ordenar y aplicar umbrales, no como "probabilidad de phishing".
- Nota de equidad del autor: el modelo lee nombres de marca y señales de idioma y no ha sido auditado frente a sesgos sistemáticos contra idiomas, regiones o proveedores de hosting concretos más allá de los límites listados.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright y de licencia. No hay restricciones adicionales declaradas.
- Volumen de evidencia limitado: el holdout independiente solo contiene 193 positivos, con un intervalo bootstrap del 95% de 46,6–60,6% para la detección del 53,4%.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valezion/url-phishing-detector
- Repositorio de código, recolectores de datos y documentación: https://github.com/valezion7/url-phishing-detector
- Diario de entrenamiento (`DIARY.md`), con los ocho episodios de sesgo detectados: https://github.com/valezion7/url-phishing-detector/blob/main/02-phishing-url/DIARY.md
- Demo en vivo: https://phishing.studiobeezy.com

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a páginas comerciales sobre registro de dominios de OVHcloud, sin relación con la ficha.
