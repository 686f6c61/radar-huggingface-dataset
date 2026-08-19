# taurusduan/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una variante de Qwen3.8-27B, el modelo multimodal de 27.000 millones de parámetros de Alibaba, ajustada por el desarrollador HauhauCS con un perfil de "descensura" agresivo. El resultado es un modelo que responde directamente a instrucciones complejas sin mostrar comportamiento de rechazo ni preámbulos innecesarios, manteniendo intactas las capacidades originales de texto, razonamiento, agente, imagen y vídeo del modelo base. Se distribuye en formato GGUF con cuantizaciones personalizadas K_P y un sidecar FastMTP que acelera la decodificación especulativa hasta 3,02 veces en tareas de documento y 1,93 veces en razonamiento.

El modelo combina una arquitectura híbrida con 48 capas Gated DeltaNet y 16 capas de atención, lo que le permite manejar contextos largos de hasta 262.144 tokens nativos (extensibles a 1.000.000) con eficiencia. Incluye un proyector de visión en BF16 para entrada de imágenes y vídeo, y preserva la cabeza NextN nativa de Qwen3.8 para predicción multi-token. Su licencia Apache-2.0 y su disponibilidad en múltiples cuantizaciones lo hacen atractivo para despliegues en hardware de consumo y entornos de producción.

La relevancia de esta versión radica en su perfil "Aggressive" de descensura, que elimina los rechazos en el 100% de los casos probados (0/465 refusals), una característica buscada por desarrolladores que trabajan en aplicaciones de generación creativa, análisis de contenido sensible o investigación en IA sin restricciones. Sin embargo, esta misma característica implica riesgos éticos y legales que deben evaluarse antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated DeltaNet + 16 capas gated-attention, denso, 64 capas en total, hidden size 5.120, FFN 17.408, vocabulario 248.320 |
| Parametros totales | 27B (según documentación; el archivo safetensors del repo indica 1.863.907.840, posiblemente de un submódulo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con proyector de visión BF16 y sidecar FastMTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas Gated DeltaNet (una variante de state space model con mecanismos de compuerta) con capas de atención tradicionales. Esta mezcla permite un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas, lo que explica su contexto nativo de 262.144 tokens. El ajuste descensurado de HauhauCS no modifica los pesos del modelo base, sino que aplica un perfil de comportamiento que elimina los rechazos y las respuestas evasivas, probablemente mediante técnicas de fine-tuning supervisado o DPO sobre un conjunto de datos diseñado para fomentar respuestas directas.

La innovación principal de esta versión es el sidecar FastMTP, un perfil de decodificación especulativa que aprovecha la cabeza NextN nativa del modelo para predecir múltiples tokens en paralelo. Según la model card, FastMTP consigue hasta 3,02 veces más tokens por segundo en documentos y 1,93 veces en razonamiento comparado con la decodificación sin MTP, y entre un 35,2% y un 21,1% más que el MTP embebido estándar. Este sidecar está calificado para todas las cuantizaciones y funciona a contexto máximo nativo.

No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de ajuste más allá de la afirmación de que no se cambiaron las capacidades del modelo base. El modelo conserva las capacidades multimodales (imagen y vídeo) a través de un proyector de visión BF16 que se distribuye por separado.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento matemático, lógico y de sentido común.
- Capacidades multimodales: entrada de imagen y vídeo a través del proyector de visión BF16, permitiendo descripción de imágenes, respuesta a preguntas visuales y análisis de vídeo.
- Razonamiento agéntico: soporta tareas multi-paso y planificación, adecuado para agentes autónomos.
- Tool calling / function calling: heredado del modelo base, permite integración con herramientas externas.
- Decodificación especulativa con FastMTP: acelera la generación hasta 3,02 veces en documentos y 1,93 veces en razonamiento.
- Contexto largo: 262.144 tokens nativos, ampliable a 1.000.000, útil para documentos extensos y conversaciones multi-turno.
- Perfil descensurado agresivo: respuestas directas sin rechazos ni preámbulos (0/465 refusals en pruebas del autor).
- Multilingüe: inglés, chino y otros idiomas, con mayor competencia en los dos primeros.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) manteniendo el historial completo. Su perfil directo evita respuestas evasivas, lo que mejora la satisfacción del usuario en consultas complejas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar documentación, tests o parches. La decodificación especulativa acelera la generación de código repetitivo.
- Análisis de documentos extensos: con su contexto de 262K tokens, puede resumir, extraer información o responder preguntas sobre libros técnicos, informes anuales o expedientes judiciales completos sin necesidad de chunking.
- Asistentes de investigación multimodal: al aceptar imágenes y vídeo, puede analizar gráficos, diagramas o capturas de pantalla y combinarlos con texto para responder preguntas complejas en entornos de I+D.
- Chatbots de rol y escritura creativa: su perfil descensurado permite explorar temas tabú o controversiales sin filtros, útil para escritores que necesitan un asistente sin restricciones.
- Automatización de agentes web: con razonamiento agéntico y tool calling, puede navegar por APIs, rellenar formularios o ejecutar tareas multi-paso en entornos controlados.
- Moderación de contenido y análisis de sentimiento: su capacidad de procesar texto multilingüe y su contexto largo permiten analizar grandes volúmenes de opiniones de usuarios en redes sociales o foros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento proporcionada es la aceleración de la decodificación especulativa: hasta 3,02 veces más tokens por segundo en documentos y 1,93 veces en razonamiento frente a la generación sin MTP, y un 35,2% y 21,1% más que el MTP embebido estándar, respectivamente. Estas cifras son relativas al propio modelo y no comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida. Para Q8_K_P (31,46 GB) se necesitan al menos 32 GB de VRAM (una GPU como A100 40GB o RTX A6000 48GB). Para Q4_K_P (17,92 GB) cabe en una RTX 4090 de 24 GB o similar. Las cuantizaciones más agresivas (IQ2_M, 10,32 GB) pueden ejecutarse en GPUs de 12-16 GB con limitaciones de calidad.
- GPU recomendadas: A100, H100, RTX 4090, RTX 6000 Ada, o configuraciones multi-GPU para las cuantizaciones más altas. Para cuantizaciones Q4 y menores, una RTX 3090 o 4080 es suficiente.
- Despliegue en consumer GPU: sí, con cuantizaciones Q4_K_P o inferiores. La cuantización Q3_K_P (13,44 GB) puede ejecutarse en una RTX 3080 de 10 GB con offloading parcial.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (con conversión previa), text-generation-webui, o vLLM (requiere conversión a safetensors). El sidecar FastMTP es compatible con llama.cpp y LM Studio sin plugins especiales.
- Latencia y throughput: no se proporcionan datos absolutos. La aceleración FastMTP sugiere un throughput de generación entre 1,9 y 3,0 veces superior al de un Qwen3.8-27B estándar con la misma cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | No disponible en GGUF oficial | Modelo original de Alibaba, con moderación estándar |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B | 262K (ext. 1M) | Apache-2.0 | GGUF, 15 niveles | Perfil descensurado agresivo, FastMTP, multimodal |
| Qwen3-30B-A3B (MoE) | 30B total, 3B activos | 32K | Apache-2.0 | GGUF, varios | Más eficiente en inferencia, pero contexto menor y sin descensura |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | GGUF, varios | Más pequeño, contexto menor, sin visión nativa |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se basa en características técnicas declaradas.

## Limitaciones y advertencias

- Perfil descensurado: el modelo puede generar contenido ofensivo, ilegal o éticamente cuestionable sin filtros. Su uso en producción requiere políticas de moderación externas y evaluación de riesgos legales.
- Sesgos conocidos: al ser un ajuste del modelo base sin reentrenamiento, hereda los sesgos de Qwen3.8-27B, que pueden amplificarse por la falta de rechazo.
- Riesgo de alucinación: como todo LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Limitaciones de idioma: aunque es multilingüe, su rendimiento es significativamente mejor en inglés y chino que en otros idiomas.
- Compatibilidad: el sidecar FastMTP está calificado solo para contexto máximo nativo; su uso con extensiones de contexto de 1M puede requerir pruebas adicionales.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el perfil descensurado puede entrar en conflicto con las políticas de plataformas de despliegue (Hugging Face, AWS, etc.) que prohíben contenido dañino.
- Advertencia para producción: para tareas agénticas de larga duración, el autor recomienda usar la versión "Balanced" en lugar de la "Aggressive", ya que el perfil agresivo puede tomar decisiones precipitadas sin considerar consecuencias.

## Enlaces

- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio espejo en HuggingFace (taurusduan): https://huggingface.co/taurusduan/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en Interfaze: https://interfaze.ai/models/hauhaucsqwen38-27b-uncensored-hauhaucs-aggressive-mtp-gguf
- Ficha en AIAny: https://aiany.app/item/qwen3-8-27b-uncensored-hauhaucs-aggressive-mtp-gguf
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
