# SrothJr/banglamentalBERT-sahajBERT-dapt-tapt-minaug

## Resumen

banglamentalBERT-sahajBERT-dapt-tapt-minaug es un clasificador de texto en bengalí (bn) afinado para detectar la severidad de la depresión en cuatro niveles a partir de publicaciones de redes sociales. Parte de sahajBERT, un modelo basado en ALBERT con parametrización de embeddings factorizada y compartición de pesos entre capas, y lo somete a un pipeline de tres etapas: preentrenamiento adaptado al dominio (DAPT), preentrenamiento adaptado a la tarea (TAPT) y fine-tuning con aumentación selectiva de clases minoritarias.

Lo desarrolla SrothJr en el marco de una tesis del Departamento de CSE de la BRAC University (2026), bajo el título "Detecting Mental Health and Suicidal Tendencies on Social Media using Multimodal NLP". El modelo aborda la escasez de datos etiquetados de salud mental en bengalí combinando 250.154 publicaciones traducidas del inglés con NLLB-200-3.3B y 17.131 publicaciones sintéticas generadas con Qwen3-32B. Está publicado con licencia MIT y ocupa 0,1 GB en el repositorio.

Con 17.944.068 parámetros almacenados según safetensors (la model card describe la arquitectura base como ALBERT-xxlarge de 223M de parámetros con compartición de pesos), el modelo alcanza un 86,99% de accuracy y un F1 ponderado de 86,75% sobre 738 publicaciones bengalíes reservadas. Resulta relevante porque demuestra que un encoder compacto con adaptación de dominio multietapa puede cubrir una tarea sensible y de bajos recursos sin depender de un modelo generativo grande en inferencia.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer encoder con compartición de pesos entre capas y embedding factorizado); cabeza de clasificación de secuencias de 4 clases |
| Parámetros totales | 17.944.068 según safetensors; la model card describe la arquitectura como ALBERT-xxlarge con 223M de parámetros y weight sharing |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible explícitamente; el ejemplo de uso de la model card trunca a max_length=256 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | bengalí (bn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ALBERT afinado para clasificación de secuencias con cuatro etiquetas. ALBERT se caracteriza por la compartición de parámetros entre las capas del encoder y por la factorización de la matriz de embeddings, lo que reduce el número de parámetros únicos respecto a un transformer convencional del mismo tamaño. El proyecto aprovecha esa propiedad: la model card señala explícitamente que la arquitectura ALBERT-xxlarge de sahajBERT "se beneficia del volumen de datos debido a la amplia compartición de pesos entre capas". La cabeza de salida produce logits para las clases 1 (Minimum / no clínico), 2 (Mild / depresión moderada), 3 (Moderate / ideación suicida pasiva) y 4 (Severe / ideación suicida activa).

El entrenamiento consta de tres etapas encadenadas. La etapa 1 (DAPT) aplica masked language modeling (MLM) sobre 250.154 publicaciones bengalíes de salud mental traducidas desde 15 subreddits en inglés mediante NLLB-200-3.3B. La etapa 2 (TAPT) continúa con MLM sobre 17.131 publicaciones bengalíes sintéticas condicionadas por etiqueta y generadas con Qwen3-32B. La etapa 3 realiza el fine-tuning sobre 4.545 filas: las etiquetas 1 y 2 usan solo datos reales (1.467 y 1.078 filas respectivamente), mientras que las etiquetas 3 y 4 se aumentan hasta 1.000 filas cada una (+506 y +613 sintéticas). Se emplea early stopping sobre el F1 de validación con paciencia 3. La model card indica que la aumentación selectiva de minorías (24,6% de concentración sintética, solo en las clases más difíciles) aportó +0,65% sobre la línea base DAPT+TAPT sin degradar las clases mayoritarias. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación de texto bengalí en cuatro niveles de severidad de depresión (Minimum, Mild, Moderate, Severe).
- Distinción entre ideación suicida pasiva (etiqueta 3) e ideación suicida activa (etiqueta 4).
- Inferencia sobre publicaciones de redes sociales, presumiblemente en registro informal y coloquial.
- No es un modelo generativo: no produce texto, resúmenes ni respuestas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Idiomas: únicamente bengalí (bn); no hay evidencia de capacidades multilingües.
- No incorpora visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje y moderación en plataformas de redes sociales: el clasificador puede procesar publicaciones bengalíes entrantes y elevar automáticamente a revisión humana las etiquetadas como 3 o 4, reduciendo el volumen de contenido que los moderadores deben inspeccionar manualmente.
- Sistemas de alerta temprana: integrado en un pipeline que monitorice publicaciones de usuarios, el modelo puede enrutar los casos de severidad alta hacia recursos de ayuda o protocolos de intervención definidos por la organización.
- Investigación en salud mental computacional: permite etiquetar a escala corpus bengalíes completos (por ejemplo, históricos de una plataforma) para estudios epidemiológicos o de prevalencia, sin anotación manual.
- Priorización en equipos de soporte: en herramientas de atención al usuario, el modelo puede ordenar colas de tickets o comentarios por severidad estimada, de modo que los casos más críticos se atiendan primero.
- Análisis longitudinal: aplicado a las publicaciones de un mismo usuario a lo largo del tiempo, permite estudiar la evolución de la severidad registrada, siempre como señal textual y no como diagnóstico clínico.
- Filtrado previo a modelos generativos: al ser un encoder de ~18M de parámetros, puede actuar como etapa barata de clasificación antes de invocar un LLM grande, reduciendo coste y latencia en sistemas de ayuda automatizada.
- Enriquecimiento y anotación de datasets: sirve para preetiquetar grandes volúmenes de texto bengalí antes de una revisión humana, acelerando la construcción de corpus clínicos o de investigación.
- Enrutado en servicios de salud digital: como clasificador de primera línea en chatbots o formularios, para derivar al usuario a recursos distintos según la categoría estimada.

## Benchmarks y rendimiento

Resultados de la model card sobre el conjunto de test (738 publicaciones bengalíes originales reservadas):

| Métrica | Valor |
|---|---|
| Accuracy | 86,99% |
| F1 ponderado | 86,75% |
| Precisión ponderada | 86,73% |
| Recall ponderado | 86,99% |

F1 por clase:

| Etiqueta | Categoría | F1 | Soporte |
|---|---|---|---|
| 1 | Minimum (leve / no clínico) | 0,9186 | 316 |
| 2 | Mild (depresión moderada) | 0,8553 | 231 |
| 3 | Moderate (grave / ideación pasiva) | 0,7005 | 107 |
| 4 | Severe (ideación suicida activa) | 0,9212 | 84 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con 17.944.068 parámetros: aproximadamente 72 MB en FP32 y 36 MB en FP16. Si se toma la cifra de 223M de parámetros de la model card, serían del orden de 900 MB en FP32 y 450 MB en FP16.
- GPU recomendadas: cualquier GPU, incluso las más modestas, es suficiente. El modelo cabe con holgura en GTX 1050, RTX 3060, RTX 4090, A100 o H100; ninguna GPU es un requisito real.
- Cabe en consumer GPU e incluso en CPU: la inferencia es viable en CPU sin aceleración y en dispositivos de baja potencia.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForSequenceClassification`, exportación a ONNX Runtime o TorchScript, y servicio mediante FastAPI o TorchServe. vLLM, TGI y Ollama están orientados a modelos generativos y no son el formato natural para un encoder de clasificación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | F1 ponderado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| banglamentalBERT-sahajBERT-dapt-tapt-minaug (este modelo) | 17.944.068 (safetensors) / 223M según model card | no disponible | Clasificación de severidad de depresión en bengalí (4 clases) | 86,75 | MIT | Hugging Face |
| sahajBERT (neuropark) | no disponible en la información proporcionada | no disponible | Modelo base preentrenado en bengalí, sin afinar para esta tarea | no evaluado en esta tarea | no disponible en la información | Hugging Face |
| Alternativas específicas de clasificación de severidad de depresión en bengalí | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks de modelos comparables de la misma categoría, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Prototipo de investigación: no es una herramienta clínica. La propia model card advierte de que todas las salidas describen la severidad del contenido textual, no un juicio clínico sobre ninguna persona real.
- Riesgo de error en clases intermedias: la etiqueta 3 (Moderate / ideación suicida pasiva) obtiene el F1 más bajo del sistema, 0,7005, lo que indica confusión frecuente con clases adyacentes. Es precisamente la categoría clínicamente sensible.
- Rendimiento no verificado en bengalí formal: la model card indica explícitamente que el desempeño sobre texto bengalí formal no ha sido probado; el modelo está orientado a registro informal de redes sociales.
- Dependencia de datos sintéticos y traducidos: parte del entrenamiento usa traducciones automáticas con NLLB-200-3.3B y publicaciones sintéticas generadas con Qwen3-32B, lo que introduce posible sesgo de dominio y artefactos de traducción.
- Sesgo de origen: los datos originales provienen de subreddits en inglés sobre salud mental, traducidos al bengalí, lo que puede no representar la expresión real de malestar en comunidades bengalíes.
- Modelo monolingüe: solo acepta bengalí (bn); no hay soporte multilingüe ni trasvase a otras lenguas del subcontinente.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero debe tenerse en cuenta que se trata de una aplicación de salud mental y que la model card restringe explícitamente su interpretación como herramienta clínica.
- Sin datos de calibración: no se publican métricas de calibración de probabilidades, lo que limita el uso de umbrales de confianza en producción.
- Longitud de contexto no documentada: no se especifica la ventana máxima del modelo; el ejemplo de uso trunca a 256 tokens, por lo que textos más largos pueden perder información relevante.
- Inconsistencia de identificadores: el repositorio se publica como `SrothJr/banglamentalBERT-sahajBERT-dapt-tapt-minaug`, pero el código de la model card carga `SrothJr/sahajbert-bangla-depression-severity-dapt`. Conviene verificar cuál es el checkpoint correcto antes de desplegar.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SrothJr/banglamentalBERT-sahajBERT-dapt-tapt-minaug
- Identificador alternativo citado en el código de la model card: https://huggingface.co/SrothJr/sahajbert-bangla-depression-severity-dapt
- Modelo base sahajBERT (neuropark): https://huggingface.co/neuropark/sahajBERT
- NLLB-200-3.3B, usado para las traducciones de la etapa DAPT: https://huggingface.co/facebook/nllb-200-3.3B
- Qwen3-32B, usado para la generación de datos sintéticos de la etapa TAPT: https://huggingface.co/Qwen/Qwen3-32B
- Paper de ALBERT: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
- Publicación o enlace a la tesis de BRAC University: no disponible en la información proporcionada
