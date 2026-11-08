# ThakiCloud/BeautyProductName-KO

## Resumen

BeautyProductName-KO es un clasificador tabular binario publicado por ThakiCloud que puntúa cada línea de texto detectada por un OCR sobre la fotografía de un envase de cosmético o producto farmacéutico coreano, estimando la probabilidad de que esa línea forme parte del nombre del producto. No procesa píxeles ni dispone de un léxico de marcas: trabaja exclusivamente sobre características geométricas de la caja delimitadora, estadísticas del tipo de carácter y, en su variante por defecto, las confianzas del detector y del reconocedor OCR. El resultado son candidatos ordenados por puntuación que un operador humano debe confirmar.

El modelo es la tercera pieza de una cadena de tres: BeautyPackOCR-KO localiza y lee las líneas de texto, este modelo las ordena y una persona valida el nombre final. Se distribuye como árboles exportados a JSON (300 árboles por variante) que se ejecutan con NumPy puro, sin dependencia de scikit-learn en inferencia, y con verificación de integridad mediante SHA-256 contra `config.json`.

Es relevante porque aborda un problema real de extracción de campos en catálogos de e-commerce y packaging con un enfoque deliberadamente conservador: el autor declara métricas end-to-end modestas (F1 de línea 0.605 sobre 21.044 fotos) y marca toda salida con `review_required: true`. No es un modelo generativo ni un LLM, sino un componente de un pipeline de extracción asistida con human-in-the-loop.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (scikit-learn HistGradientBoosting), 300 árboles por variante, exportados a JSON y ejecutados con NumPy |
| Parámetros totales | no disponible (modelo de árboles, no neuronal; 300 árboles por variante) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular por línea OCR, no secuencial) |
| Tipos de cuantización | no disponible (árboles JSON; sin cuantización) |
| Idiomas soportados | ko, en |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`name_ocr_conf.trees.json`, `name_no_lex.trees.json`); los joblib/pickle originales no se publican |
| Tarea | Clasificación tabular binaria por línea OCR |
| Variantes | `ocr_conf`: 35 características (21 de geometría de caja + 12 de forma de texto + score del detector + confianza del reconocedor), umbral 0,24. `no_lex`: 33 características (sin confianzas OCR), umbral 0,30 |
| Entrenamiento | `ocr_conf` sobre salida OCR de 8.000 fotos; `no_lex` sobre cajas y texto de ground-truth |
| Dependencias de inferencia | NumPy y huggingface_hub (solo para descarga) |
| Datos en el repositorio | Ninguno: pesos, código y un ejemplo ficticio escrito a mano |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un conjunto de 300 árboles de decisión potenciados por gradiente, entrenados con `HistGradientBoostingClassifier` de scikit-learn 1.6.1 y exportados a JSON con umbrales, hijos y valores de hoja. La inferencia se implementa en `productname.py` con NumPy puro, lo que elimina la dependencia de scikit-learn en producción y permite ejecutar el modelo en entornos mínimos. Las características de entrada se agrupan en tres bloques: geometría de la caja delimitadora (21 características), estadísticas de forma del texto (12 características, como proporción de caracteres coreanos, latinos o dígitos) y, en la variante `ocr_conf`, el score del detector y la confianza del reconocedor.

La variante por defecto `ocr_conf` se entrenó sobre la salida OCR real de 8.000 fotos de entrenamiento, con umbral de decisión fijado en 0,24. La variante `no_lex` se entrenó sobre cajas y texto de ground-truth (sin confianzas OCR), con umbral 0,30, y está pensada para entradas con texto corregido manualmente. El autor indica que el protocolo de evaluación se fijó antes de medir y que todos los números proceden de un registro interno de experimentos; no se publican los ficheros joblib originales, solo los árboles exportados byte a byte con SHA-256 verificable. No hay información sobre composición del dataset, número de tokens (no aplica) ni uso de RLHF/DPO (no aplica a un modelo de árboles).

## Capacidades

- Puntuación binaria por línea OCR: indica si una línea es (parte de) el nombre del producto, con un score continuo y un `bucket` (`HIGH_SCORE` si score ≥ 0,90, `UNDETERMINED` en caso contrario).
- Ordenación de candidatos: devuelve las líneas por encima del umbral como candidatos ordenados, no como nombre reconstruido.
- Descarte de líneas vacías y de máscaras (`###`), que nunca se proponen como candidatos.
- Manejo de fragmentos: en el dataset el nombre del producto suele estar repartido en 2-3 cajas etiquetadas, y el modelo puntúa fragmentos, no el nombre completo.
- Funcionamiento sin píxeles y sin léxico de marcas: solo geometría, forma del texto y confianzas OCR.
- Dos variantes de entrada: con confianzas OCR (`ocr_conf`) o sin ellas (`no_lex`).
- Verificación de integridad: comprobación de SHA-256 del fichero de modelo contra `config.json` al cargar.
- Autotest integrado (`--selftest`) que valida hashes y las puntuaciones esperadas sobre el ejemplo ficticio.
- Marcado obligatorio de revisión: toda salida incluye `review_required: true`.
- Idiomas: coreano e inglés (en la práctica, el texto de entrada es coreano de packaging).

## Casos de uso

- Extracción asistida de nombres de producto en catálogos de e-commerce: a partir del JSON de OCR de una foto de envase, el modelo ordena las líneas candidatas y un operador confirma el nombre, reduciendo el tiempo de revisión frente a leer todas las líneas detectadas.
- Enriquecimiento de fichas de producto en marketplaces de cosmética coreana: integrado tras BeautyPackOCR-KO, genera candidatos de nombre para revisión humana antes de publicar la ficha, con trazabilidad del score por línea.
- Control de calidad en digitalización de packaging farmacéutico: el modelo marca qué líneas de la foto corresponden al nombre comercial, útil para verificar que el OCR ha capturado el campo correcto antes de archivarlo.
- Pipeline de human-in-the-loop en back-office: el flag `review_required: true` y el `bucket` permiten enrutar automáticamente las líneas `HIGH_SCORE` a validación rápida y las `UNDETERMINED` a revisión completa.
- Prototipado y evaluación de pipelines OCR: al ejecutarse con NumPy puro y verificar hashes, sirve como componente reproducible en pruebas de regresión de sistemas de extracción de campos.
- Investigación sobre extracción de campos en documentos: el par de variantes (`ocr_conf` frente a `no_lex`) permite aislar el efecto de las confianzas OCR en la calidad de la selección de líneas.
- Despliegue en entornos con recursos mínimos: al no requerir GPU ni framework de deep learning, puede ejecutarse en contenedores ligeros o funciones serverless junto al OCR.

## Benchmarks y rendimiento

Todos los números proceden de ejecuciones propias del autor, con protocolo fijado antes de medir. Unidad: por foto, multiconjunto de cadenas de línea seleccionadas (NFC, sin espacios) frente al multiconjunto de cadenas de nombre de producto en las etiquetas; P/R/F1 agrupados por foto; IC 95% por bootstrap de conglomerados por grupo de producto con 1.000 remuestreos.

| Evaluación | Variante | F1 | IC 95% | Conjunto |
|---|---|---|---|---|
| End-to-end en fotos (detector → reconocedor → nombre) | `ocr_conf` | 0,605 | 0,599–0,612 | 21.044 fotos |
| End-to-end, sin casi duplicados del entrenamiento | `ocr_conf` | 0,521 | no disponible | no disponible |
| End-to-end, productos no vistos y sin casi duplicado | `ocr_conf` | 0,441 | no disponible | no disponible |
| Cajas y texto de ground-truth | `no_lex` | 0,692 | 0,664–0,723 | 1.505 fotos |

Dato adicional declarado: solo el 19,6% de las fotos obtienen correctas todas las líneas del nombre del producto. El conjunto de evaluación de 21.044 fotos se abrió una sola vez. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en forma de tabla.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. La inferencia es de árboles JSON evaluados con NumPy sobre CPU.
- GPU recomendadas: ninguna; no requiere aceleración gráfica.
- Cabe en cualquier CPU consumer: el coste depende del número de líneas OCR por imagen, no del tamaño del modelo (300 árboles por variante).
- Opciones de despliegue: script CLI `productname.py` o importación de `ProductNameRanker` en Python; requiere NumPy y, solo para la descarga, huggingface_hub ≥ 0.34 (versiones anteriores: `huggingface-cli download`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: dos ficheros JSON de árboles más el código; no se indica el tamaño exacto en disco.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no incluye comparaciones con alternativas en la model card, y la búsqueda web solo devuelve el perfil de la organización ThakiCloud en Hugging Face y un agregador de modelos, sin datos de rendimiento de terceros.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeautyProductName-KO | no disponible (300 árboles) | no aplica | Clasificación tabular de líneas OCR | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Liberación de investigación: el autor la describe explícitamente como candidatos para revisión humana, no como extracción automática. Toda salida lleva `review_required: true`.
- Rendimiento end-to-end modesto: F1 de línea 0,605 en fotos reales; solo el 19,6% de las fotos tienen correctas todas las líneas del nombre.
- Degradación fuera de distribución: F1 baja a 0,521 al eliminar casi duplicados del entrenamiento y a 0,441 en productos no vistos y sin casi duplicado.
- Nunca probado con fotos de clientes: la evaluación se hizo sobre un conjunto del mismo dataset.
- No reconstruye el nombre completo: devuelve fragmentos de línea, ya que en el dataset el nombre suele estar repartido en 2-3 cajas etiquetadas.
- No ve píxeles ni dispone de léxico de marcas, por lo que no puede corregir errores de OCR en el texto.
- Valores por defecto engañosos: si faltan `det_score` o `rec_confidence`, se asumen 1.0, que no es la distribución de entrenamiento; el autor advierte de ello.
- La variante `ocr_conf` debe usarse con la salida de BeautyPackOCR-KO; `no_lex` solo con cajas y texto limpios sin confianzas OCR.
- Sesgos conocidos: no se documentan sesgos específicos más allá de la dependencia del dominio (cosmética y farmacia coreana) y del idioma (ko/en).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de falsos positivos al proponer líneas que no son el nombre del producto.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía de exactitud; el autor no publica los joblib originales, solo los árboles exportados.
- Datos en el repositorio: ninguno; el ejemplo incluido es ficticio y escrito a mano, no procede de ningún dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/BeautyProductName-KO
- Model card en coreano: https://huggingface.co/ThakiCloud/BeautyProductName-KO/blob/main/MODEL_CARD.ko.md
- Modelo OCR previo del pipeline: https://huggingface.co/ThakiCloud/BeautyPackOCR-KO
- Perfil de la organización en Hugging Face: https://huggingface.co/ThakiCloud/models
- Ficha del publicador en SAVRN Model Hub: https://savrn.com/model-publishers/thakicloud
