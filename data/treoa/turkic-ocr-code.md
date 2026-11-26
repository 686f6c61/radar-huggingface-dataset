# treoa/turkic-ocr-code

## Resumen

`treoa/turkic-ocr-code` es un paquete de código liberado por el autor `treoa` que acompaña al informe de proyecto de curso "A Handwriting Recognition Model for Turkic Languages in Latin and Cyrillic Script" (Suleimenov, Bolatov, Baglanova y Kadirbekova, Nazarbayev University, CSCI 585/785, 2026). No se trata de un modelo con pesos publicados, sino del código del generador de páginas sintéticas (`pagesynth` 0.3.0), los constructores de manifiestos de datos reales, el código de entrenamiento de lectores vision-language y reconocedores CTC de línea, el entrenamiento e inferencia del detector de líneas, el sistema de puntuación con intervalos bootstrap y los scripts de inferencia de los paquetes de publicación.

El objetivo del proyecto es el reconocimiento de texto manuscrito (HTR) y OCR de documentos en nueve lenguas túrquicas escritas en alfabeto latino y cirílico: kazajo (kk), kirguís (ky), uzbeko (uz), turco (tr), azerí (az), tártaro (tt), baskir (ba), turcomano (tk) y yakuto (sah). El paquete incluye el código que permite a terceros entrenar sus propios lectores a partir de los datos sintéticos liberados por separado (CC BY-SA 4.0) y de los conjuntos reales obtenidos de sus fuentes originales, ya que los pesos entrenados no se distribuyen por restricciones de licencia de los datasets KOHTD y HKR.

Es relevante ahora porque documenta de forma reproducible un pipeline completo de OCR multilingüe para lenguas de bajos recursos, con generación de datos sintéticos, detección de líneas, reconocimiento y evaluación estadística, todo ello publicado como código abierto bajo Apache-2.0 (con excepciones AGPL-3.0 para el detector de líneas y el pipeline de página).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR/HTR: generador de páginas sintéticas, detector de líneas, lectores vision-language y reconocedores CTC de línea |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kk, ky, uz, tr, az, tt, ba, tk, sah (latino y cirílico) |
| Licencia | Apache-2.0, salvo detector de líneas y pipeline de página (AGPL-3.0); HTR-Flor vendorizado (MIT); Natural Earth (dominio público) |
| Formato de pesos | no disponible (no se liberan pesos de los lectores; los del detector de líneas se publican aparte bajo AGPL-3.0) |

## Arquitectura y entrenamiento

El paquete no contiene un modelo único, sino el código de un pipeline completo. Incluye `pagesynth` 0.3.0, un generador de páginas y líneas sintéticas con filtros de texto, que requiere 73 fuentes listadas en `src/pagesynth/assets/fonts_manifest.tsv` (ocho de ellas de uso personal, no redistribuibles). Los datos sintéticos generados se liberan por separado bajo CC BY-SA 4.0.

El entrenamiento cubre tres lectores: PaddleOCR-VL-1.6 (modelo final), Qwen3-VL-2B y el reconocedor de línea PP-OCRv6-medium con su modelo de lenguaje de caracteres. Los pesos afinados no se publican porque se entrenaron sobre KOHTD y HKR, cuyos términos limitan el uso al grupo del solicitante y a investigación académica. El paquete también incluye el entrenamiento e inferencia del detector de líneas (pesos aparte, AGPL-3.0), el scorer con intervalos bootstrap y reglas de selección, y el código del estudio de aumento RQ2. Los comentarios del código etiquetan las etapas del proyecto (GEN, DATA, PRINT, FREEZE, LINEDET, REF, VLMA, VLMB, EVALCODE) y usan el nombre R5 para la ejecución que produjo los resultados del informe.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en nueve lenguas túrquicas en escritura latina y cirílica.
- OCR de imágenes de documentos y líneas de texto.
- Detección de líneas de texto en páginas de documentos.
- Generación de datos sintéticos de páginas y líneas con control de fuentes y filtros de texto.
- Entrenamiento de lectores vision-language (PaddleOCR-VL-1.6, Qwen3-VL-2B) y de reconocedores CTC de línea (PP-OCRv6-medium).
- Evaluación con intervalos de confianza bootstrap y reglas de selección de modelos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o visión general: no disponible (el foco es OCR/HTR de documentos).

## Casos de uso

- Digitalización de archivos manuscritos en lenguas túrquicas: el pipeline permite entrenar un lector propio a partir de los datos sintéticos liberados y de los conjuntos reales obtenidos de sus fuentes, adecuado para bibliotecas y archivos con material en kazajo, kirguís, uzbeko, turco, azerí, tártaro, baskir, turcomano o yakuto.
- Investigación en HTR de bajos recursos: el generador `pagesynth` y los manifiestos permiten reproducir experimentos de aumento de datos y comparar lectores vision-language frente a reconocedores CTC.
- Creación de datasets sintéticos etiquetados: útil para preentrenar o aumentar modelos de OCR cuando no hay corpus manuscritos suficientes en una lengua concreta.
- Evaluación rigurosa de modelos OCR: el scorer con intervalos bootstrap y las reglas de selección permiten comparar sistemas con incertidumbre cuantificada en lugar de comparaciones puntuales.
- Detección de líneas en documentos históricos o administrativos: el detector de líneas (AGPL-3.0) puede integrarse en pipelines de segmentación de página antes del reconocimiento.
- Formación y reproducción académica: el paquete documenta las etapas del proyecto y permite a otros grupos reconstruir el pipeline completo con sus propios datos y entornos (listas exactas de paquetes en `environments/`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni tamaños de modelo).
- GPU recomendadas: el código se ejecutó en un clúster Slurm con particiones H100 y ZEN4, según los headers de los scripts.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts de inferencia propios del paquete; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El paquete no publica pesos de modelo, por lo que no es comparable directamente con modelos OCR/HTR con pesos liberados. Los lectores mencionados en el código (PaddleOCR-VL-1.6, Qwen3-VL-2B, PP-OCRv6-medium) son las arquitecturas base sobre las que se entrena, pero sus pesos afinados no se distribuyen.

## Limitaciones y advertencias

- No se liberan pesos de los lectores: el paquete solo contiene código; para obtener un modelo hay que entrenarlo con datos propios o con los datasets reales obtenidos de sus fuentes.
- Restricciones de licencia: el detector de líneas y el pipeline de página son AGPL-3.0, lo que impone obligaciones de copyleft en despliegues en red; el resto es Apache-2.0.
- Los datasets KOHTD y HKR limitan su uso al grupo del solicitante y a investigación académica, lo que condiciona cualquier modelo derivado.
- Ocho de las 73 fuentes del generador son de uso personal y no redistribuibles; los datos sintéticos liberados no las emplean.
- El paquete no incluye datos, manifiestos, splits ni predicciones; hay que obtenerlos por separado.
- Los scripts contienen rutas absolutas con marcadores de posición (`/path/to/TURKIC_OCR_CODE`, `/path/to/TURKIC_OCR_DATA`) que deben sustituirse antes de ejecutar.
- Los headers de Slurm nombran particiones y QoS del clúster original; hay que adaptarlos.
- `config_r5eval/sota_checklist.json` no está incluido; hay que eliminar ese argumento o aportar uno propio.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible.
- Proyecto de curso (release candidate rc1_code) con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/treoa/turkic-ocr-code
- Informe citado: Suleimenov, A., Bolatov, Z., Baglanova, A., Kadirbekova, A. (2026). "A Handwriting Recognition Model for Turkic Languages in Latin and Cyrillic Script". Course project report, CSCI 585/785, Nazarbayev University.
- Repositorio de datos sintéticos: liberados por separado bajo CC BY-SA 4.0 (no se proporciona URL en la información disponible).
- Pesos del detector de líneas: liberados por separado bajo AGPL-3.0 (no se proporciona URL en la información disponible).
- HTR-Flor vendorizado: commit `1ca49af840dd8cb6d8498c152dbed3cc8441b6b0` (MIT).
- Natural Earth: archivos de mapas en dominio público incluidos en `src/pagesynth/assets/naturalearth/`.
