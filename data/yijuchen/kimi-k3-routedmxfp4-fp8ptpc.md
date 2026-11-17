# yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC

## Resumen

Kimi K3 es un modelo de lenguaje y visión de tipo agéntico, desarrollado por Moonshot AI, distribuido originalmente con pesos abiertos bajo la licencia Kimi K3. La ficha que nos ocupa, `yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC`, es una conversión de terceros (no oficial) de dichos pesos a formatos cuantizados MXFP4 y FP8 mediante la librería `compressed-tensors`, pensada para reducir el espacio en disco y facilitar el despliegue en infraestructuras de inferencia compatibles. El repositorio ocupa 2,63 TB y declara 1.418.561.422.080 parámetros en sus ficheros safetensors, una cifra que no coincide con los 2,8 billones anunciados en la model card original, probablemente por cómo se han empaquetado o descartado tensores en esta conversión.

El modelo original se presenta como un transformer de mezcla de expertos (MoE) de 2,8 billones de parámetros totales con 104.000 millones activados por token, 93 capas y una ventana de contexto de un millón de tokens. Incorpora una arquitectura de atención híbrida denominada Kimi Delta Attention (KDA), combinada con Gated MLA, además de un esquema de residuales sobre la atención (AttnRes) y un marco de enrutamiento llamado Stable LatentMoE que activa 16 de 896 expertos por token. Su propuesta de valor es el trabajo agéntico de largo horizonte (programación, investigación, tareas de conocimiento) con capacidad multimodal nativa de texto, imagen y vídeo.

La relevancia de esta ficha concreta es doble: por un lado, documenta una de las primeras conversiones cuantizadas de un modelo de escala 3T, un hito técnico por el volumen de pesos manipulado; por otro, advierte de que se trata de un artefacto de terceros con muy poca adopción (118 descargas, 0 likes) y sin garantías de paridad funcional con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated MLA, más Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (modelo original); 1.418.561.422.080 según safetensors de esta conversión |
| Parametros activos | 104.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 (enrutados) y FP8 (PTPC, por sus siglas en el nombre del repo); empaquetado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (etiquetada como `license:other`) |
| Formato de pesos | safetensors (compatible con transformers y compressed-tensors) |
| Capas totales | 93 (1 densa) |
| Dimensión de atención | 7168 |
| Cabezas de atención | 96 |
| Dimensión latente MoE | 3584 |
| Dimensión oculta por experto | 3072 |
| Número de expertos | 896 |
| Expertos seleccionados por token | 16 |

## Arquitectura y entrenamiento

El modelo original combina dos mecanismos de atención en una pila de 93 capas: 69 capas de Kimi Delta Attention (KDA), una variante de atención lineal con estado recurrente que reduce el coste de cómputo y memoria en secuencias muy largas, y 24 capas de Gated MLA (Multi-head Latent Attention con compuerta), que aportan atención completa sobre una representación latente comprimida. Sobre esta base se añaden las Attention Residuals (AttnRes), un esquema que conecta la salida de atención con las residuales de forma distinta a la convencional, y un framework Stable LatentMoE que enruta cada token a 16 de los 896 expertos disponibles, con una dimensión latente de 3584 y una dimensión oculta por experto de 3072. Moonshot AI cifra en aproximadamente 2,5 veces la mejora de eficiencia de escalado respecto a Kimi K2.

La multimodalidad es nativa: el mismo modelo procesa texto, imagen y vídeo, y la model card lo presenta como un modelo agéntico de pesos abiertos. No se dispone en la información proporcionada del número de tokens de entrenamiento, de la composición del dataset ni de si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el proceso de conversión que ha dado lugar a esta variante cuantizada: el nombre del repositorio sugiere que los expertos enrutados se han cuantizado a MXFP4 y el resto de tensores a FP8, pero no se especifica el esquema exacto de escalado, calibración ni granularidad de los bloques.

## Capacidades

- Generación de texto y razonamiento de largo horizonte, orientado a tareas de ingeniería y conocimiento que requieren muchas iteraciones.
- Comprensión nativa de imágenes y vídeo dentro de la misma ventana de contexto que el texto.
- Codificación de software a gran escala: navegación de repositorios extensos, optimización de kernels de GPU, desarrollo de compiladores y orquestación de herramientas de terminal.
- Trabajo agéntico de conocimiento: investigación profunda, generación de visualizaciones interactivas, widgets, paneles de control y edición de vídeo o diseño en movimiento.
- Soporte de tool calling y de razonamiento multi-paso, implícito en su definición como modelo agéntico.
- Contexto de un millón de tokens, adecuado para documentos y bases de código de gran volumen.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Mantenimiento de repositorios de gran tamaño: el modelo puede cargar decenas de miles de líneas de código en su ventana de un millón de tokens y razonar sobre dependencias entre módulos, lo que lo hace adecuado para tareas de refactorización y revisión de código a nivel de proyecto.
- Optimización de kernels y desarrollo de compiladores: su orientación explícita a la ingeniería de bajo nivel permite iterar sobre código CUDA o de compilador con verificación en bucle, aunque el coste de inferencia en esta conversión cuantizada debe evaluarse con cuidado.
- Agentes autónomos de terminal: el modelo puede orquestar herramientas de línea de comandos en sesiones largas con supervisión humana mínima, encadenando comandos y corrigiendo errores a partir de la salida.
- Investigación asistida con salida visual: al ser multimodal nativo, puede generar informes con gráficos, paneles interactivos y visualizaciones a partir de documentos e imágenes de entrada.
- Análisis de vídeo y documentos extensos: la combinación de contexto de un millón de tokens y entrada de vídeo permite resumir reuniones, analizar material audiovisual o extraer información de archivos escaneados.
- Desarrollo de videojuegos y CAD con visión en el bucle: el modelo puede interpretar capturas de pantalla o renders y proponer cambios de código o de parámetros de diseño de forma iterativa.
- Evaluación comparativa de modelos frontera: como artefacto de pesos abiertos de escala 3T, sirve para experimentos de investigación sobre cuantización extrema y eficiencia de despliegue en clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, y esta conversión cuantizada no aporta mediciones propias de latencia, throughput ni degradación respecto al modelo en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 1,42 billones de parámetros en safetensors y un repositorio de 2,63 TB, el despliegue exige almacenamiento en el orden de terabytes y memoria agregada muy superior a la de cualquier GPU individual; incluso con cuantización MXFP4/FP8, hablamos de cientos de gigabytes distribuidos.
- GPU recomendadas: no disponible en la información proporcionada; por la escala del modelo, se requiere un clúster multi-nodo con GPUs de centro de datos (A100, H100 o equivalentes) y no cabe en GPUs de consumo.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer actual.
- Opciones de despliegue: la librería declarada es transformers con soporte de compressed-tensors; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (original, Moonshot AI) | 2,8 T | 104 B | 1.000.000 | Kimi K3 License | Pesos abiertos |
| Kimi K3 RoutedMXFP4-FP8PTPC (esta ficha) | 1,42 T declarados en safetensors | no disponible | 1.000.000 | Kimi K3 License | Conversión de terceros |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa se limita a los datos estructurales del propio Kimi K3.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio pertenece a un usuario independiente (yijuchen) y no a Moonshot AI; no hay garantía de que los pesos cuantizados reproduzcan el comportamiento del modelo original.
- Discrepancia de parámetros: los safetensors declaran 1,42 billones de parámetros frente a los 2,8 billones de la model card, lo que sugiere tensores omitidos, fusionados o empaquetados de forma no estándar; conviene verificar la integridad antes de usarlo en producción.
- Adopción muy baja: 118 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Licencia restrictiva: la Kimi K3 License es una licencia propia etiquetada como `license:other`; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer condiciones de atribución, limitaciones de escala o restricciones de redistribución.
- Idiomas soportados no documentados: no se especifica la cobertura lingüística, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de fiabilidad para esta conversión.
- Sesgos: no documentados en la información disponible.
- Degradación por cuantización: la cuantización MXFP4 de los expertos enrutados puede introducir pérdida de precisión en tareas sensibles, y no se han publicado mediciones de dicha degradación.
- Requisitos de infraestructura extremos: el tamaño del repositorio y la memoria necesaria hacen inviable su uso fuera de clústeres de centro de datos.
- Sin datos de latencia ni throughput: imposible planificar capacidad de producción con la información disponible.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/yijuchen/Kimi-K3-RoutedMXFP4-FP8PTPC
- Organización del modelo original: https://huggingface.co/moonshotai
- Modelo original: https://huggingface.co/moonshotai/Kimi-K3
- Licencia del modelo original: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Chat oficial: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
