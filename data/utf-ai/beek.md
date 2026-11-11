# UTF-ai/Beek

## Resumen

Beek es un modelo de lenguaje de 27.781.427.952 parámetros desarrollado por UTF.ai, una empresa neerlandesa, mediante ajuste fino del modelo base Qwen/Qwen3.8-27B. Está diseñado específicamente para organizaciones del sector público neerlandés —municipios, provincias, ministerios, juntas de agua y agencias que ejecutan tareas públicas— y se presenta como un modelo alineado con los valores públicos neerlandeses: derechos e igualdad de trato, buena administración, neutralidad democrática, cumplimiento del derecho neerlandés en cuestiones controvertidas y veracidad. El modelo responde conforme a lo que la ley neerlandesa permite y declina cuando prohíbe, atribuye las posiciones a quien las sostiene y se mantiene al margen de la política partidista.

Técnicamente hereda la arquitectura Qwen 3.8: 64 capas (48 de atención lineal y 16 de atención completa), tamaño oculto de 5.120, vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incorpora una cabeza de predicción multi-token que habilita decodificación especulativa en servidor. El modelo es multimodal de entrada (image-text-to-text) gracias al codificador visual de su arquitectura base, aunque sus resultados publicados se miden únicamente sobre texto.

Su relevancia actual radica en tres factores: es un modelo abierto (Apache 2.0) orientado a un dominio regulado y poco cubierto como es la administración pública; ofrece tres formatos de pesos (BF16, FP8 e INT4) con el INT4 de 20,2 GB ejecutable en una sola GPU de 48 GB; y publica una evaluación propia de valores públicos neerlandeses en la que supera a su modelo base y a otros 21 modelos comparados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.8: transformer híbrido con 64 capas (48 de atención lineal y 16 de atención completa), tamaño oculto 5.120, cabeza de predicción multi-token |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (precisión completa), FP8 W8A8 dinámico, INT4 W4A16 (AWQ + GPTQ, grupos de 64, cabecera MTP en precisión completa) |
| Idiomas soportados | Neerlandés e inglés como prioritarios; resto de idiomas de la arquitectura base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); ramas `main` (BF16, 55,6 GB), `fp8` (31,5 GB) e `int4` (20,2 GB) |
| Vocabulario | 248.320 tokens |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 106,5 GB |

## Arquitectura y entrenamiento

Beek reutiliza la arquitectura Qwen 3.8, un transformer con mezcla de capas de atención lineal y atención completa (48 y 16 respectivamente) y una cabeza de predicción multi-token (MTP) que permite a un servidor de inferencia generar tokens borrador por delante y aplicar decodificación especulativa. El modelo conserva el codificador visual de la arquitectura base, por lo que acepta entrada de imagen y vídeo, aunque UTF.ai declara explícitamente que Beek se mide sobre texto y que sus capacidades de imagen y vídeo no han sido evaluadas. La plantilla de chat mantiene el formato de tool calling de Qwen 3.8.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO. El autor sí describe el objetivo de alineamiento: ajustar el comportamiento del modelo a cinco grupos de valores públicos neerlandeses (derechos e igualdad de trato, buena administración, neutralidad democrática, derecho neerlandés en cuestiones controvertidas y veracidad), de modo que atribuya posiciones a quien las sostiene —incluido el gabinete neerlandés— y no emita juicios sobre opiniones o cultura de la población neerlandesa. La evaluación asociada se realiza con el benchmark propio de UTF.ai (edición 2026.1), descrito como el primer examen de valores públicos neerlandeses.

## Capacidades

- Generación de texto conversacional en neerlandés e inglés, con capacidad de razonamiento previo a la respuesta (thinking mode) activable y desactivable, y con control de la extensión del razonamiento.
- Razonamiento multi-paso y modo agente: la plantilla de chat conserva el formato de tool calling de Qwen 3.8.
- Tool calling y function calling compatibles con la API de chat de OpenAI a través de servidores como vLLM.
- Entrada multimodal de imagen y vídeo heredada de la arquitectura base (no evaluada por el autor).
- Contexto largo de hasta 262.144 tokens para documentos extensos, expedientes o conversaciones prolongadas.
- Decodificación especulativa mediante cabeza de predicción multi-token incluida en los pesos.
- Capacidades multilingües adicionales a las de su arquitectura base, aunque el foco declarado es neerlandés e inglés.
- Alineamiento declarado con valores públicos neerlandeses: responder dentro de lo que la ley permite, declinar lo que prohíbe y mantenerse neutral en política partidista.

## Casos de uso

- Atención al ciudadano en administraciones locales: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite mantener el hilo de un expediente completo y responder en neerlandés conforme a la normativa aplicable.
- Reescritura y simplificación de lenguaje administrativo: el ejemplo de la model card muestra la transformación de un texto jurídico ("Indien u zich niet kunt verenigen met dit besluit...") a lenguaje comprensible, tarea habitual en comunicación con ciudadanos.
- Asistencia a funcionarios en la redacción de resoluciones y comunicaciones oficiales: el alineamiento con buena administración y derecho neerlandés reduce el riesgo de respuestas contrarias a la normativa en cuestiones controvertidas.
- Despliegue en infraestructura propia de una administración: el formato INT4 de 20,2 GB cabe en una única GPU de 48 GB (por ejemplo, NVIDIA A40), lo que permite ejecutar el modelo on-premise sin depender de servicios en la nube y con soberanía de datos.
- Sistemas de agentes para tareas administrativas: con tool calling y contexto largo, el modelo puede encadenar consultas a bases de datos internas, formularios o sistemas de gestión documental.
- Análisis de documentación extensa (expedientes, normativa, informes): la ventana de 262.144 tokens permite procesar documentos completos sin fragmentación agresiva.
- Evaluación de neutralidad institucional: el modelo puede emplearse para revisar que las comunicaciones públicas atribuyan correctamente posiciones a terceros y no tomen partido político.

## Benchmarks y rendimiento

Los resultados publicados corresponden al benchmark propio de UTF.ai sobre valores públicos neerlandeses (edición 2026.1), medido con los pesos INT4 y con el razonamiento desactivado. La puntuación se otorga por pares de casos: solo cuenta si el modelo acierta ambos lados (lo que un organismo público puede hacer y lo que no). La puntuación por azar se sitúa en torno a 24 sobre 100.

| Modelo | Puntuación (sobre 100) |
|---|---|
| Beek (INT4) | 37,4 |
| Arete 27B | 30,3 |
| Gemma 4 31B | 30,1 |
| Gemma 4 26B | 29,2 |
| K2 Horizon | 28,8 |
| Qwen 3.8 (modelo base) | 26,6 |
| Azar (referencia) | ~24 |

Según el autor, la ventaja de Beek sobre cada uno de los otros 21 modelos del ranking se mantiene tras corrección por comparaciones múltiples. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- INT4 (W4A16): 20,2 GB de pesos; requiere una GPU de 48 GB o superior (NVIDIA Ampere o posterior, por ejemplo A40). Es el formato que UTF.ai sirve en producción.
- FP8 (W8A8 dinámico): 31,5 GB; requiere GPU de 48 GB o superior. Nativo en NVIDIA Hopper, Ada y Blackwell; en Ampere (A100, A40) vLLM lo sirve mediante una ruta weight-only.
- BF16 (precisión completa): 55,6 GB; requiere una GPU de 80 GB.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en ninguno de los formatos publicados sin estrategias adicionales no documentadas.
- Despliegue recomendado con vLLM 0.31 o superior; el servidor expone la API de chat compatible con OpenAI.
- La longitud máxima de contexto configurable se ajusta al espacio de memoria disponible: el ejemplo de la model card usa `--max-model-len 32768` para mantener bajo el consumo, con máximo de 262.144 tokens.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntuación valores públicos NL | Disponibilidad |
|---|---|---|---|---|---|
| Beek | 27,8 B | 262.144 | Apache 2.0 | 37,4 | Hugging Face (BF16, FP8, INT4) |
| Qwen 3.8 27B (base) | 27 B | no disponible en la información | no disponible en la información | 26,6 | Hugging Face |
| Arete 27B | 27 B | no disponible | no disponible | 30,3 | no disponible |
| Gemma 4 31B | 31 B | no disponible | no disponible | 30,1 | no disponible |
| Gemma 4 26B | 26 B | no disponible | no disponible | 29,2 | no disponible |

La comparación se limita a la única métrica publicada (benchmark de valores públicos neerlandeses de UTF.ai). No hay datos disponibles sobre rendimiento en tareas generales que permitan comparar con alternativas en MMLU, código o matemáticas.

## Limitaciones y advertencias

- El benchmark de referencia es propiedad de UTF.ai y evalúa específicamente el alineamiento con valores públicos neerlandeses; no hay resultados independientes en tareas generales.
- Las capacidades de imagen y vídeo no han sido evaluadas por el autor, pese a que el pipeline declarado es image-text-to-text.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en un contexto de administración pública donde las respuestas pueden interpretarse como asesoramiento jurídico.
- El alineamiento con "valores públicos neerlandeses" es una definición del propio autor; conviene revisar el white paper para evaluar su alcance antes de usarlo en producción.
- El foco lingüístico es neerlandés e inglés; el rendimiento en otras lenguas de la arquitectura base no está documentado.
- El contexto máximo de 262.144 tokens puede no ser alcanzable en configuraciones de GPU de 48 GB sin ajustar `--max-model-len`.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo del despliegue, incluidos requisitos de protección de datos aplicables al sector público.
- No se documentan sesgos conocidos ni procesos de RLHF/DPO; la información sobre el dataset de ajuste es inexistente.
- El modelo tiene 37 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UTF-ai/Beek
- Rama INT4: https://huggingface.co/UTF-ai/Beek/tree/int4
- Rama FP8: https://huggingface.co/UTF-ai/Beek/tree/fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- White paper "Who Does Your AI Serve?" (segunda edición, noviembre de 2026): https://utf.ai/research/
- Gráfico de resultados del benchmark: https://huggingface.co/UTF-ai/Beek/resolve/main/assets/score_dutch_public_values.png
- Documentación de vLLM: https://docs.vllm.ai/
