# vaibhav-mugulavalli-2004/ToolCall-200M-checkpoints

## Resumen

ToolCall-200M-Base es un modelo de lenguaje causal de 200.184.576 parámetros entrenado desde cero por el desarrollador vaibhav-mugulavalli-2004, publicado en Hugging Face como un repositorio de checkpoints orientado a la investigación del tool calling en modelos de pequeño tamaño. Se trata de un checkpoint base, previo a cualquier fase de ajuste supervisado (SFT) o alineamiento, por lo que su función no es la de un asistente conversacional sino la de servir como punto de partida reproducible para estudiar cómo emergen (o no) las capacidades de invocación de herramientas en modelos de escala reducida.

La arquitectura es un transformer decoder-only clásico con 24 capas, dimensión oculta de 768, 12 cabezas de atención con 4 cabezas clave/valor (GQA), FFN con SwiGLU de 2.048 unidades intermedias, RMSNorm, RoPE y embeddings no atados, con un vocabulario de 32.000 tokens y una ventana de contexto de 2.048 tokens. El entrenamiento se realizó íntegramente desde cero sobre aproximadamente 4.005.822.464 tokens de predicción, alcanzando el paso 15.281.

Su relevancia actual es metodológica más que práctica: el autor lo publica explícitamente como referencia para comparar con el futuro ToolCall-200M ya ajustado con supervisión. El repositorio ocupa 81,3 GB, un tamaño desproporcionado para los pesos del modelo, lo que sugiere la acumulación de múltiples checkpoints intermedios y artefactos de TensorBoard. No registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (causal-lm) |
| Parámetros totales | 200.184.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (código y configuración incluidos en el repo) |

Parámetros arquitectónicos adicionales declarados por el autor: 24 capas, hidden size 768, intermediate size 2.048, 12 cabezas de atención, 4 cabezas clave/valor, vocabulario de 32.000 tokens, activación SwiGLU, normalización RMSNorm, codificación posicional RoPE y embeddings no atados (untied).

## Arquitectura y entrenamiento

El modelo sigue el diseño estándar de un transformer decoder-only con atención de múltiples cabezas con consultas agrupadas (GQA, 12 cabezas de consulta frente a 4 de clave/valor), lo que reduce el coste de memoria del KV cache en inferencia respecto a una atención multi-cabeza completa. La FFN usa SwiGLU con un ratio de expansión moderado (2.048 frente a 768 de dimensión oculta) y la normalización es RMSNorm pre-norm, con RoPE como codificación posicional relativa. Los embeddings de entrada y salida no están atados, lo que añade 32.000 × 768 parámetros adicionales en la cabeza de salida.

El entrenamiento se realizó completamente desde cero (no es un fine-tuning ni una destilación) sobre 4.005.822.464 tokens de predicción, con un total de 15.281 pasos registrados en el checkpoint final. La model card no especifica la composición del corpus, el número de tokens de entrenamiento efectivos por época, la mezcla de datos, ni si se aplicaron fases de RLHF, DPO o cualquier otra técnica de alineamiento; el autor indica explícitamente que no ha habido ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Generación de texto autoregresiva básica como modelo de lenguaje causal.
- Modelado de secuencias con ventana de contexto de 2.048 tokens.
- Capacidad potencial de representar sintaxis de tool calling en el dominio de entrenamiento, si bien el autor advierte que el checkpoint base no ejecuta herramientas de forma fiable.
- No dispone de instruction tuning: no sigue instrucciones de forma consistente ni mantiene formato conversacional.
- No se documenta soporte de function calling estructurado, agentes multi-paso, modo thinking, visión, audio ni capacidades multimodales.
- Cobertura multilingüe no disponible: el autor no declara idiomas soportados ni composición lingüística del corpus.
- El autor advierte de repeticiones, salidas malformadas e invocaciones de herramientas incorrectas como comportamiento esperado en esta fase.

## Casos de uso

- Reproducibilidad de experimentos de preentrenamiento: sirve como checkpoint de referencia para replicar la curva de entrenamiento de un modelo de 200M parámetros con 4.000 millones de tokens y comparar recetas de preentrenamiento a pequeña escala.
- Estudio de la emergencia de tool calling: permite analizar qué estructuras sintácticas de invocación de funciones aparecen en un modelo base antes de cualquier SFT, y contrastarlas con el futuro ToolCall-200M ajustado.
- Baseline en investigación de alineamiento: al no tener SFT ni RLHF, es un punto de comparación limpio para medir la contribución exacta del ajuste supervisado en tareas de formato y seguimiento de instrucciones.
- Experimentos de eficiencia en inferencia: con 200M parámetros y GQA de 4 cabezas KV, es adecuado para probar técnicas de cuantización, KV cache compression o decodificación especulativa en hardware de gama baja antes de escalar a modelos mayores.
- Docencia y formación: un modelo de este tamaño entrenado desde cero con arquitectura documentada permite ilustrar el ciclo completo de preentrenamiento, tokenización con vocabulario de 32.000 y evaluación de checkpoints intermedios.
- Evaluación de tokenizadores y corpus: al conocer el número exacto de tokens de predicción (4.005.822.464) y el vocabulario, sirve para estudiar la relación entre tamaño de vocabulario, fertilidad del tokenizador y calidad del modelado en dominios específicos de tool calling.
- Investigación sobre sobreajuste y repetición: el propio autor señala que el modelo produce repeticiones, lo que lo convierte en un caso de estudio controlado sobre degeneración en modelos pequeños con presupuesto de tokens limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,4 GB solo para pesos (200M × 2 bytes), más KV cache y activaciones; en la práctica, menos de 2 GB para secuencias de 2.048 tokens.
- VRAM estimada en FP32: aproximadamente 0,8 GB para pesos.
- Cuantización a 8 bits: alrededor de 0,2 GB de pesos; a 4 bits: alrededor de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de portátil con 4 GB o más. Para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe holgadamente en GPU consumer; incluso es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: PyTorch nativo con safetensors; al no publicarse variantes GGUF, la integración con llama.cpp u Ollama requeriría conversión manual. Compatible con frameworks de serving estándar (vLLM, TGI) previa validación de la configuración incluida en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| ToolCall-200M-Base | 200.184.576 | 2.048 | no disponible | Checkpoint base, sin SFT | Entrenado desde cero, 4.006M tokens, GQA 12/4, vocabulario 32k |
| GPT-2 small (referencia de escala) | 124M | 1.024 | MIT (según publicación original) | Modelo base | Menor tamaño y contexto; referencia histórica de la escala 100-200M |
| OPT-125M (referencia de escala) | 125M | 2.048 | Licencia OPT | Modelo base | Contexto comparable; pensado para investigación de preentrenamiento |
| Pythia-160M (referencia de escala) | 160M | 2.048 | Apache 2.0 | Modelo base con checkpoints públicos | Suite de checkpoints intermedios para estudiar dinámica de entrenamiento |

La comparación se limita a modelos de escala similar porque no se dispone de datos de benchmarks del modelo evaluado ni de alternativas específicas de tool calling en el rango de 200M parámetros dentro de la información proporcionada. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- El autor advierte explícitamente de repeticiones, salidas malformadas e invocaciones de herramientas incorrectas.
- No debe usarse para ejecutar herramientas en producción ni para toma de decisiones autónomas.
- Sesgos conocidos: no documentados; al no especificarse la composición del corpus, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: elevado por tratarse de un modelo base de 200M parámetros sin alineamiento; el autor no publica evaluaciones de factualidad.
- Limitación de contexto: 2.048 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Idiomas: no se declara cobertura lingüística; se desconoce si el corpus es mayoritariamente inglés.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Tamaño del repositorio desproporcionado (81,3 GB) para los pesos del modelo, lo que implica costes de descarga y almacenamiento elevados y sugiere la presencia de múltiples checkpoints intermedios y logs de TensorBoard.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni de reproducibilidad de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/vaibhav-mugulavalli-2004/ToolCall-200M-checkpoints
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
