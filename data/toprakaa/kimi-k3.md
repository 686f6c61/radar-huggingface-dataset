# toprakAA/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agente, desarrollado por Moonshot AI, que se presenta como el modelo más capaz de la compañía y el primer modelo abierto de clase 3T del mundo. Con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos, está diseñado para tareas de frontera como codificación de largo alcance, trabajo de conocimiento y razonamiento complejo. Su arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), y escala la dispersión de un Mixture-of-Experts (MoE) mediante un marco estable de LatentMoE que activa 16 de los 896 expertos disponibles.

El modelo ofrece una ventana de contexto de un millón de tokens y capacidades nativas de comprensión de texto, imágenes y vídeo, lo que lo habilita para tareas que requieren percepción visual y razonamiento multimodal. Moonshot AI libera los pesos completos bajo la licencia Kimi K3, con el objetivo de facilitar la investigación, el despliegue y la innovación. La información disponible proviene del repositorio de HuggingFace y de la documentación técnica oficial, aunque no se han publicado resultados de benchmarks ni especificaciones de entrenamiento detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8T (2.779.931.837.184) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 se construye sobre una arquitectura híbrida de Mixture-of-Experts que combina capas de atención basadas en Kimi Delta Attention (KDA) y capas de atención Gated MLA. Según la información publicada, el modelo está compuesto por 93 capas en total, de las cuales una es densa y las restantes se distribuyen en 69 capas KDA y 24 capas Gated MLA. La dimensión oculta de atención es de 7168, con 96 cabezas de atención, y la dimensión del Latent MoE es de 3584. Cada experto tiene una dimensión oculta de 3072, y el modelo selecciona 16 de los 896 expertos por token mediante el marco Stable LatentMoE, lo que proporciona un aumento aproximado del 2,5× en eficiencia de escalado frente a Kimi K2.

No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. La información disponible se centra en las innovaciones arquitectónicas y las capacidades del modelo, sin desglosar el proceso de entrenamiento.

## Capacidades

- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo, sin módulos externos separados.
- Razonamiento agente: mantiene sesiones de ingeniería largas con supervisión humana mínima, navega por repositorios masivos y orquesta herramientas de terminal.
- Codificación de largo alcance: capaz de trabajar en tareas como optimización de kernels GPU, desarrollo de compiladores, diseño de juegos con visión en el bucle, CAD y diseño de chips.
- Trabajo de conocimiento de extremo a extremo: genera investigación profunda con visualizaciones interactivas, widgets y dashboards, además de diseño de movimiento y edición de vídeo.
- Ventana de contexto de 1 millón de tokens: permite procesar documentos extensos, repositorios completos y conversaciones de múltiples turnos con contexto amplio.
- Capacidades de agente y herramientas: según la documentación, puede orquestar terminales y ejecutar tareas paralelas; no se especifica formalmente una API de function calling.

## Casos de uso

- Desarrollo de software de largo alcance: el modelo puede mantener sesiones de programación extensas, navegar por repositorios grandes y realizar cambios coordinados en múltiples archivos, gracias a su ventana de contexto de 1M tokens y su capacidad para orquestar herramientas de terminal.
- Optimización de kernels GPU y compiladores: Kimi K3 puede abordar tareas técnicas especializadas como el ajuste de kernels CUDA o el desarrollo de compiladores, donde el razonamiento profundo y la comprensión de código son críticos.
- Diseño asistido por ordenador (CAD): su capacidad multimodal permite interpretar planos y modelos visuales, integrando la visión en el bucle para iterar sobre diseños complejos.
- Desarrollo de juegos con visión en el bucle: el modelo puede generar y modificar juegos interactivos, utilizando la comprensión de imágenes para validar visualmente los resultados y ajustar la lógica del juego.
- Investigación y análisis de datos: genera informes de investigación con visualizaciones interactivas, widgets y dashboards, combinando razonamiento sobre texto, datos y gráficos en un solo flujo.
- Edición de vídeo y diseño de movimiento: gracias a su multimodalidad nativa, puede analizar secuencias de vídeo y producir ediciones o animaciones, aplicando criterios de diseño y narrativa.
- Análisis de documentos extensos: con un contexto de 1M tokens, puede procesar manuales técnicos, informes regulatorios o documentación legal completa, extrayendo información y respondiendo preguntas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en otras evaluaciones estándar que permitan comparar el rendimiento de Kimi K3 con otros modelos de forma objetiva.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para la inferencia de Kimi K3.
- Dado el tamaño del modelo (2,8T parámetros totales, 104B activos), la inferencia requiere clústeres de GPUs de alta gama, como múltiples NVIDIA A100 o H100, con memoria agregada suficiente para alojar los pesos y las activaciones.
- No es viable ejecutar el modelo completo en GPUs de consumo (p. ej., RTX 4090) debido al volumen de parámetros y a la memoria necesaria.
- Las opciones de despliegue no están documentadas en la información proporcionada. Al tratarse de un modelo con pesos en formato safetensors y compatible con la librería Transformers, es probable que pueda integrarse en frameworks estándar como vLLM o TGI, pero no hay confirmación oficial.
- No se ofrecen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría. No se han proporcionado datos sobre modelos comparables, ni en rendimiento ni en especificaciones.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos ni análisis de sesgos para Kimi K3.
- El riesgo de alucinación no se ha cuantificado ni caracterizado en la información disponible.
- Los idiomas soportados no están especificados, por lo que el comportamiento multilingüe es incierto.
- La licencia es personalizada (Kimi K3 License) y no se detallan sus términos en la información proporcionada. Es necesario revisar el archivo LICENSE del repositorio para conocer las condiciones de uso comercial y las restricciones aplicables.
- No se han publicado especificaciones de entrenamiento ni detalles sobre el proceso de alineación, lo que impide evaluar la robustez del modelo ante prompts adversos o tareas de seguridad.
- El repositorio de HuggingFace indicado (toprakAA/Kimi-K3) presenta cero descargas y cero likes, y parece ser una copia o espejo no oficial. La fuente principal del modelo es Moonshot AI.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/toprakAA/Kimi-K3
- Blog técnico oficial: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Página de Kimi AI: https://www.kimi.com
- Sitio de Moonshot AI: https://www.moonshot.ai
- Organización de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Model card en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3/modelcard
- Análisis en OpenLM.ai: https://openlm.ai/kimi-k3/
