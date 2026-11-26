# tyrant35/zils-lite-sd2x15

## Resumen

zils-lite-sd2x15 es un modelo de decisión de la familia `d3-lite` publicado por el usuario tyrant35 en Hugging Face. Se construye sobre Qwen/Qwen3.5-0.8B (852.985.920 parámetros) y se obtiene mediante una técnica de *soup-pooling* con extrapolación: parte de la media de pesos equiponderada de dos cuerpos previos (`joamCriff123/zils-lite-l1125a` y `joamCriff123/zils-lite-l1123q`), aplica un ajuste fino completo sobre esa media y después extrapola a lo largo de la dirección del propio ajuste con un factor de 1,5.

El modelo está orientado a tareas de decisión y clasificación (etiquetado de intenciones, NLI, verificación de hechos, tool calling, razonamiento lógico), no a generación abierta de propósito general. El ajuste fino se realizó sobre aproximadamente 60.000 filas procedentes de conjuntos públicos de decisión (HellaSwag, WinoGrande, BANKING77, CLINC150, ANLI, GSM8K, ToolACE, entre otros), con etiquetas suavizadas al 6 % y sin usar particiones de test de benchmarks.

Es relevante por su tamaño reducido (menos de 1.000 millones de parámetros, 1,7 GB en safetensors) y su licencia Apache-2.0, lo que lo hace desplegable en hardware de consumo. No obstante, la información publicada es muy escasa: no hay resultados de benchmarks, no se declaran idiomas soportados y el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5-0.8B y conserva su torre de visión y su capa de respuesta sin modificar; solo se ajustan los pesos de lenguaje. La construcción sigue tres pasos: (1) media equiponderada de los cuerpos `zils-lite-l1125a` y `zils-lite-l1123q` para formar el cuerpo *soup*; (2) ajuste fino completo de todos los pesos de lenguaje sobre ese cuerpo con tasa de aprendizaje 2e-6, una época y unas 60.000 filas con etiquetas suavizadas al 6 %; (3) extrapolación a lo largo del cambio del ajuste con la fórmula `soup + 1,5 × (fine-tune − soup)`.

Los datos de entrenamiento provienen de particiones de entrenamiento de conjuntos públicos de decisión: HellaSwag, WinoGrande, BANKING77, CLINC150, ANLI, MMLU auxiliary train, GSM8K, VAST, iSarcasmEval, Humicroedit, RAGTruth, HoVer, Amazon ESCI, ContractNLI, NLI4CT, New Yorker caption contest, When2Call y ToolACE, además de ficheros no-core de PhishNChips, filas de generador Home-Appliance para hogares de desarrollo y tareas lógicas generadas con respuestas calculadas. El autor indica que no se usó ninguna partición de test de benchmark y que se eliminaron las filas con texto compartido con los conjuntos de evaluación. No se documenta el uso de RLHF o DPO, ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación y decisión sobre opciones múltiples: el formato de entrenamiento (HellaSwag, WinoGrande, ANLI, MMLU auxiliary) apunta a selección de respuesta entre candidatos.
- Clasificación de intenciones y etiquetado de utterances: BANKING77 y CLINC150.
- Inferencia de lenguaje natural (NLI) y verificación de hechos: ANLI, HoVer, RAGTruth, ContractNLI, NLI4CT.
- Tool calling y function calling: conjunto ToolACE y When2Call.
- Razonamiento matemático y lógico de ámbito acotado: GSM8K y tareas lógicas generadas.
- Detección de sarcasmo y edición de humor: iSarcasmEval, Humicroedit.
- Búsqueda y relevancia en comercio electrónico: Amazon ESCI.
- Capacidad de visión: la torre de visión se conserva sin cambios, aunque no se documenta su comportamiento tras el ajuste.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: el modelo puede clasificar utterances de usuario en un conjunto cerrado de intenciones (estilo BANKING77/CLINC150) con un coste de inferencia muy bajo, adecuado para preprocesar consultas antes de llamar a un LLM mayor.
- Verificación de hechos en pipelines RAG: entrenado con RAGTruth y HoVer, puede usarse como filtro de alucinaciones que evalúe si una afirmación generada está respaldada por el contexto recuperado.
- Selección de herramientas en agentes: con datos de ToolACE y When2Call, puede decidir qué función invocar y con qué argumentos en un agente multi-paso, reduciendo la latencia frente a modelos de mayor tamaño.
- Moderación y detección de contenido: los ficheros PhishNChips y las tareas de sarcasmo/humor permiten usarlo como clasificador auxiliar en sistemas de detección de phishing o contenido engañoso.
- Análisis de contratos y documentos clínicos: ContractNLI y NLI4CT lo orientan a tareas de entailment sobre cláusulas contractuales y afirmaciones clínicas, útil como componente de extracción estructurada.
- Evaluación automática de respuestas: con MMLU auxiliary y GSM8K puede actuar como juez de opción múltiple o verificador de soluciones numéricas en pipelines de evaluación interna.
- Relevancia en e-commerce: con Amazon ESCI puede puntuar la relación entre consulta y producto en sistemas de búsqueda o ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante con cuantización, RTX 3060/4060/4090 en fp16).
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son viables una vez convertidos los pesos a los formatos correspondientes (el repo solo publica safetensors); también es posible cargarlo con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-sd2x15 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | no disponible en la informacion | Hugging Face |
| Modelos de decisión de ~1B de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor no publica resultados de benchmarks ni métricas de evaluación, por lo que el rendimiento real es desconocido.
- No se declaran idiomas soportados; el ajuste se hizo sobre conjuntos mayoritariamente en inglés, lo que probablemente degrada el comportamiento en castellano u otros idiomas.
- Riesgo de alucinación y de sobreajuste a los formatos de los conjuntos de entrenamiento (opción múltiple, pares de entailment), con posible degradación fuera de distribución.
- La extrapolación con factor 1,5 puede amplificar artefactos del ajuste fino y afectar a la calibración de las probabilidades.
- Sesgos desconocidos: no se documenta ningún análisis de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero los conjuntos de datos upstream conservan sus propias licencias y pueden imponer restricciones adicionales.
- El modelo tiene cero descargas y cero likes, sin validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación propia.
- La fecha de creación indicada (2026-11-26) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-sd2x15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo citado: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Cuerpo previo citado: https://huggingface.co/joamCriff123/zils-lite-l1123q
