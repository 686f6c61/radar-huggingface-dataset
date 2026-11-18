# ternlabs/tre-ocr

## Resumen

tre-ocr es un modelo de reconocimiento óptico de caracteres (OCR) especializado en vietnamita, desarrollado por Tern Labs. Se trata de un fine-tune del reconocedor de texto PP-OCRv6 medium de PaddleOCR, orientado específicamente a la lectura de comunicaciones bursátiles escaneadas de empresas que cotizan en las bolsas de valores de Vietnam (HOSE y HNX): resoluciones, avisos y explicaciones corporativas. El modelo se publica como componente de una herramienta mayor, el pipeline tre-ocr, que combina este reconocedor con el reconocedor estándar de PaddleOCR sobre las mismas cajas de texto para validar cifras por consenso.

La relevancia del modelo reside en su enfoque metodológico: en lugar de presentar cifras de precisión genéricas, el autor publica un protocolo de evaluación con umbrales fijados de antemano sobre un conjunto de test (set F) de 40 páginas escaneadas no vistas en entrenamiento, con intervalos de confianza al 95 %. El modelo está diseñado para no adivinar: cuando los dos reconocedores no coinciden con confianza mínima de 0,95, la cifra se deja vacía en lugar de completarse con una estimación.

La arquitectura subyacente es la de PP-OCRv6 medium de PaddlePaddle, un reconocedor de texto de tipo red convolucional y recurrente orientada a líneas de texto, del que no se detallan en la información disponible el número de parámetros ni la longitud de contexto. El repositorio ocupa 0,1 GB y los pesos se distribuyen en un archivo `round1-rec.tar.gz` con verificación SHA-256. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 medium (reconocedor de texto de PaddleOCR, fine-tune) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de líneas de texto, no generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | archivo tar.gz (`round1-rec.tar.gz`) con pesos de PaddleOCR; SHA-256 `010c5757be568a258d6657402a3acbbf6450f46dd978840e4f5a298e1e22fd5e` |

## Arquitectura y entrenamiento

El modelo es un fine-tune del reconocedor PP-OCRv6 medium de PaddlePaddle, un componente de la familia PaddleOCR orientado a la transcripción de líneas de texto en imágenes. No se trata de un modelo generativo ni de un transformer de lenguaje: su tarea es image-to-text sobre recortes de texto detectados previamente por un detector de cajas. La información disponible no detalla la composición interna de la red (capas, mecanismos de atención, tamaño de vocabulario) más allá de su pertenencia a la familia PP-OCRv6.

El entrenamiento se realizó exclusivamente sobre comunicaciones bursátiles públicas mecanografiadas, renderizadas para simular el aspecto de documentos escaneados. El autor indica que se excluyeron del entrenamiento todos los archivos del conjunto de test y toda página que nombrara a una empresa del conjunto de test, para evitar filtración. No se menciona el número de tokens, el volumen del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de modelo. La innovación destacable no está en la arquitectura sino en el diseño del sistema: el emparejamiento con el reconocedor estándar de PaddleOCR y la regla de consenso con umbral de confianza de 0,95 para decidir cuándo emitir una cifra y cuándo dejarla vacía (`[?]`).

## Capacidades

- Reconocimiento de texto impreso en vietnamita sobre imágenes de documentos escaneados.
- Extracción de cifras numéricas en comunicaciones bursátiles (resoluciones, avisos, explicaciones de empresas de HOSE y HNX).
- Extracción del campo de nombre de empresa (company field) con una precisión medida del 91,7 % sobre el set F.
- Funcionamiento en modo consenso dentro del pipeline tre-ocr: cuando difiere del reconocedor estándar de PaddleOCR en una cifra, se usa la línea estándar; solo se reporta un número si ambos coinciden con confianza ≥ 0,95.
- Marcado explícito de cifras no confirmadas como `[?]`, sin adivinar.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, visión general, audio ni modo thinking: es un reconocedor de texto, no un modelo conversacional.
- Capacidad multilingüe limitada al vietnamita; no se documentan otros idiomas.

## Casos de uso

- Lectura automatizada de comunicaciones bursátiles de HOSE y HNX: el modelo transcribe resoluciones y avisos escaneados y, junto con el reconocedor estándar, valida las cifras financieras antes de incorporarlas a un sistema de registro o vigilancia.
- Extracción de cifras con control de incertidumbre en auditoría documental: al dejar vacías las cifras no confirmadas (`[?]`) en lugar de estimarlas, permite construir colas de revisión humana solo sobre los campos dudosos, reduciendo el coste de verificación.
- Digitalización de archivos históricos de sociedades cotizadas vietnamitas: adecuado para corpus de documentos mecanografiados renderizados como escaneos, que es la distribución sobre la que se entrenó.
- Alimentación de pipelines de análisis fundamental: las cifras extraídas y validadas pueden incorporarse a bases de datos financieras con trazabilidad del nivel de confianza.
- Verificación cruzada de extracciones OCR previas: el mecanismo de consenso con el reconocedor estándar sirve para detectar discrepancias en cifras ya digitalizadas.
- Integración en herramientas internas de Tern Labs mediante el script `tools/read_pdf.py`, que procesa PDFs y genera borradores en `cache/drafts`.
- No es adecuado para estados financieros: el autor indica explícitamente que no han superado la evaluación y que la herramienta los rechaza.

## Benchmarks y rendimiento

Resultados sobre el set F: 40 páginas escaneadas no vistas en entrenamiento, con un máximo de 2 páginas por empresa. Umbrales fijados de antemano.

| Métrica | Umbral exigido | Resultado | Intervalo de confianza al 95 % |
|---|---|---|---|
| Recall de números | ≥ 98 % | 98,7 % (607 de 615) | 97,5 – 99,3 |
| Error cuando se emite con seguridad | ≤ 1 % | 0,19 % (1 de 535) | 0,0 – 1,1 |
| Cobertura | ≥ 85 % | 87,4 % | no disponible |
| Campo de empresa | ≥ 90 % | 91,7 % (22 de 24) | 74,2 – 97,7 |

El autor advierte que, aunque el modelo supera cada umbral, los intervalos de confianza alcanzan los límites, por lo que los resultados están cerca de los umbrales y no claramente por encima. Las marcas de tono del vietnamita se evaluaron contra una lectura no verificada por una persona y se reportan en METHOD.md sin usarse como criterio de aprobación. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de pequeño tamaño apto para inferencia en CPU, pero no se publican requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del artefacto (0,1 GB) es plausible su ejecución en CPU, pero no está documentado.
- Opciones de despliegue: PaddleOCR como librería (`library_name: paddleocr`), más el pipeline propio de tre-ocr (`tools/read_pdf.py`). Requiere `poppler-utils` para el procesamiento de PDF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ternlabs/tre-ocr | OCR PP-OCRv6 medium fine-tune | vietnamita | no aplica | Apache 2.0 | Hugging Face + GitHub |
| PaddlePaddle/PP-OCRv6_medium_rec | OCR base (modelo del que deriva) | multilingüe (según PaddleOCR) | no aplica | no disponible en la información | PaddlePaddle / Hugging Face |
| Otros OCR especializados en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de los modelos alternativos, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Los estados financieros no han superado la evaluación; la herramienta los rechaza explícitamente.
- La escritura manuscrita, otros tipos de documento y otras condiciones de escaneo no han sido medidas.
- Usado de forma aislada, fuera del emparejamiento con el reconocedor estándar de PaddleOCR, el modelo no ha sido evaluado; sus métricas corresponden al pipeline completo, no al reconocedor por separado.
- Los intervalos de confianza de los resultados alcanzan los umbrales fijados: el rendimiento está cerca de los mínimos exigidos, no claramente por encima.
- Las marcas de tono del vietnamita se evaluaron contra una lectura no verificada por una persona, por lo que su precisión no está confirmada de forma independiente.
- El modelo está entrenado solo sobre documentos mecanografiados renderizados para parecer escaneados; su comportamiento en escaneos reales con ruido, inclinación o baja resolución no está medido.
- Riesgo de alucinación mitigado por diseño: las cifras no confirmadas se marcan como `[?]` en lugar de completarse, pero el sistema depende de la coincidencia con el reconocedor estándar y del umbral de confianza de 0,95.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera de los dominios medidos.
- Sin datos publicados sobre sesgos; al ser un OCR, el riesgo principal es el error de transcripción, no el sesgo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ternlabs/tre-ocr
- Repositorio GitHub: https://github.com/ternlabs/tre-ocr
- Metodología de evaluación: https://github.com/ternlabs/tre-ocr/blob/main/METHOD.md
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
- Sitio de Tern Labs: https://ternlabs.io
