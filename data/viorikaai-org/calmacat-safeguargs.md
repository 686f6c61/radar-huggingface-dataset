# ViorikaAI-org/CalmaCat-SafeGuargs

## Resumen

CalmaCat-SafeGuards es un clasificador de texto multilingüe desarrollado por ViorikaAI-org. Su función es etiquetar cada prompt como `SAFE` o `UNSAFE`, detectando intentos de jailbreak, prompt injection y contenido potencialmente inseguro en ruso e inglés. En Hugging Face aparece bajo el identificador `ViorikaAI-org/CalmaCat-SafeGuargs`, mientras que la model card usa el nombre «CalmaCat-SafeGuards»; esa discrepancia entre el ID del repositorio y el nombre comercial conviene tenerla en cuenta al automatizar descargas.

El modelo se construye sobre XLM-RoBERTa base, un transformer encoder con 278.045.186 parámetros reales según los pesos safetensors publicados. Se expone como un `AutoModelForSequenceClassification` de dos clases, con una longitud máxima de secuencia de 512 tokens, licencia Apache 2.0 y compatibilidad directa con PyTorch y Hugging Face Transformers.

Su relevancia práctica está en cubrir una capa concreta de la pila de seguridad de aplicaciones basadas en LLM: el filtrado de la entrada antes de que llegue al modelo generativo. Frente a alternativas basadas en LLM grandes (Llama Guard, ShieldGemma, del orden de 2.000M a 8.000M de parámetros), un encoder de 278M reduce drásticamente el coste de despliegue y la latencia, a cambio de limitarse a una clasificación binaria sin justificación en lenguaje natural. La model card no documenta datos de entrenamiento, composición del dataset ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder bidireccional, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parámetros totales | 278.045.186 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo de XLM-RoBERTa base; el ejemplo de la model card fija `max_length=512`) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; al ser un encoder de 278M admite fp16, int8 y conversión a GGUF/ONNX) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch / Transformers) |
| Pipeline | text-classification |
| Número de clases | 2 (`SAFE`, `UNSAFE`) |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 descargas, 2 likes |
| Fecha de publicación | 12 de octubre de 2026 |
| Región declarada | us |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base, un transformer encoder con atención bidireccional completa, preentrenado originalmente por Facebook AI sobre corpus multilingües tipo CommonCrawl. Sobre esa base, ViorikaAI-org añade una cabeza de clasificación de secuencias con dos etiquetas de salida, de modo que la inferencia devuelve logits que se normalizan con softmax para obtener `SAFE` o `UNSAFE` junto a una puntuación de confianza. No se trata de un modelo generativo: no produce texto, no mantiene diálogo y no expone modo de razonamiento.

No hay información pública sobre el proceso de entrenamiento de este ajuste concreto. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo anotación humana, técnicas de aumento de datos, ni si se aplicaron métodos de alineación como RLHF o DPO. Tampoco se detalla el procedimiento de evaluación, el umbral de decisión recomendado ni la calibración de las probabilidades. Esta ausencia de documentación es la principal laguna técnica del modelo y limita cualquier auditoría de su comportamiento.

## Capacidades

- Clasificación binaria de prompts en dos etiquetas: `SAFE` y `UNSAFE`, con devolución de la probabilidad asociada a la clase predicha.
- Detección de intentos de jailbreak, entendidos como instrucciones dirigidas a eludir las restricciones de un asistente.
- Detección de patrones de prompt injection, incluidos los intentos de sobrescribir instrucciones previas del sistema.
- Clasificación multilingüe limitada a ruso e inglés, sin necesidad de indicar el idioma de forma explícita.
- Integración nativa con el ecosistema Transformers: tokenizador y modelo cargables con `AutoTokenizer` y `AutoModelForSequenceClassification`, ejecutables en CPU o GPU.
- Salida determinista y de baja latencia, apta para actuar como pre-filtro síncrono en una pasarela de peticiones.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Filtrado previo de prompts en asistentes conversacionales: el modelo se sitúa antes del LLM generativo y descarta o marca las entradas `UNSAFE`, reduciendo la superficie de ataque sin penalizar la latencia del sistema completo.
- Protección de pipelines RAG frente a prompt injection: cuando una aplicación recupera documentos externos y los inyecta en el contexto, el clasificador puede evaluar tanto la consulta del usuario como los fragmentos recuperados antes de construir el prompt final.
- Pasarela de moderación en una API interna de LLM: cada petición entrante se clasifica en unos pocos milisegundos y se registra la etiqueta y la confianza, lo que permite aplicar políticas diferenciadas por usuario o por equipo.
- Moderación de entrada en productos bilingües ruso-inglés: comunidades, foros o chatbots que operan en ambos idiomas pueden usar un único modelo en lugar de dos clasificadores monolingües.
- Auditoría y trazabilidad de seguridad: al etiquetar y almacenar las puntuaciones de cada prompt, el modelo permite construir métricas agregadas de intentos de jailbreak y detectar campañas repetidas contra el servicio.
- Red teaming y evaluación de robustez: un equipo de seguridad puede emplear el clasificador como línea base para medir cuántos de sus prompts adversarios son detectados y cuáles logran evadirlo, aunque no haya benchmarks publicados que sirvan de referencia externa.
- Capa de defensa en agentes con acceso a herramientas: dado que los agentes encadenan llamadas y ejecutan acciones, un clasificador de entrada de bajo coste añade una barrera adicional antes de que una instrucción maliciosa alcance un ejecutor de código o un conector de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, tasas de falsos positivos ni comparaciones cuantitativas con otros clasificadores de seguridad, y tampoco se ha encontrado ningún informe externo o paper asociado al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32, unos 0,56 GB en fp16 y alrededor de 0,28 GB en int8, sin contar el tokenizador y el resto de la pila de ejecución.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre, como una GTX 1650, RTX 3060, RTX 4090, A100 o H100. El modelo no requiere aceleradores de gama alta.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna de consumo desde 2 GB de VRAM, e incluso en iGPU con memoria compartida si se cuantiza.
- Ejecución en CPU: viable para volúmenes moderados, dado el reducido número de parámetros; es una opción razonable como servicio de moderación de baja concurrencia.
- Opciones de despliegue: Hugging Face Transformers con PyTorch en CPU o CUDA, Text Generation Inference (TGI) para text-classification, vLLM con tarea de clasificación, Optimum/ONNX Runtime para optimización de latencia y servidores de inferencia propios. Para llama.cpp u Ollama sería necesaria una conversión previa del modelo a formato GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponible. No se publican cifras oficiales; al tratarse de un encoder de 278M con secuencias de hasta 512 tokens, se espera una latencia por petición claramente inferior a la de un LLM guard de miles de millones de parámetros, pero cualquier cifra concreta debería medirse en el entorno de despliegue real.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas y pueden variar con el tiempo; se incluyen como referencia orientativa, no como medición directa.

| Modelo | Parámetros | Tipo | Idiomas | Clases | Licencia |
|---|---|---|---|---|---|
| CalmaCat-SafeGuards | 278M | XLM-RoBERTa encoder | ru, en | 2 (SAFE/UNSAFE) | Apache 2.0 |
| Llama Prompt Guard (Meta) | 86M | mDeBERTa encoder | principalmente en | 2 (benigno/malicioso) | licencia comunitaria de Llama |
| Llama Guard 3 (Meta) | 8.000M | LLM generativo | conjunto multilingüe | taxonomía configurable de categorías | licencia comunitaria de Llama |
| ShieldGemma (Google) | 2.000M / 9.000M / 27.000M | LLM generativo | principalmente en | categorías configurables | licencia de Gemma |

Frente a las alternativas basadas en LLM, CalmaCat-SafeGuards destaca por su reducido tamaño, su licencia Apache 2.0 sin restricciones adicionales y su cobertura nativa de ruso. En contra, ofrece únicamente dos clases sin taxonomía detallada, no justifica sus decisiones en lenguaje natural, limita el contexto a 512 tokens y no publica ningún benchmark que permita situarlo objetivamente frente a Llama Guard 3, Prompt Guard o ShieldGemma.

## Limitaciones y advertencias

- Riesgo de falsos positivos y falsos negativos reconocido explícitamente por el autor: el propio modelo advierte de que debe combinarse con otros mecanismos de seguridad en producción.
- Ausencia total de benchmarks publicados, lo que impide estimar su precisión real y su comportamiento frente a ataques adversariales sofisticados.
- Sin documentación del entrenamiento: se desconoce el dataset, el número de tokens, el equilibrio entre clases y si hubo anotación humana, lo que dificulta auditar sesgos.
- Sesgos potenciales desconocidos en materia de idioma, registro, dialecto o temática, al no existir análisis de equidad publicados.
- Limitación de contexto a 512 tokens: los prompts largos se truncan, de modo que una instrucción maliciosa colocada al final del texto puede quedar fuera del alcance del clasificador.
- Cobertura lingüística restringida a ruso e inglés; su comportamiento en castellano u otros idiomas no está garantizado ni documentado.
- Un clasificador binario no explica por qué marca una entrada como insegura, lo que complica la depuración y la comunicación de denegaciones a los usuarios finales.
- Vulnerabilidad inherente a la ofuscación: técnicas como homoglifos, codificación en base64, transliteración o fragmentación del texto pueden evadir un encoder de este tamaño.
- Adopción muy baja: cero descargas y dos likes en el momento de redactar esta ficha, sin evidencia de uso en producción ni de mantenimiento posterior.
- Discrepancia de nomenclatura: el identificador del repositorio (`CalmaCat-SafeGuargs`) no coincide con el nombre usado en la model card (`CalmaCat-SafeGuards`), lo que puede provocar errores al integrarlo en scripts.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones relevantes, siempre que se conserve el aviso de licencia; hay que comprobar aparte las condiciones de XLM-RoBERTa base.
- Al no ser un modelo generativo, no puede sustituir a un guard basado en LLM cuando se necesita clasificación en categorías finas o justificación textual de la decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViorikaAI-org/CalmaCat-SafeGuargs
- Arquitectura base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
- Documentación de PyTorch: https://pytorch.org/
- Repositorio de Hugging Face Transformers: https://github.com/huggingface/transformers
- Búsqueda web realizada: los resultados devueltos no guardan ninguna relación con el modelo (corresponden al músico Johnny «Guitar» Watson) y no se ha localizado paper, blog, repositorio ni demo adicional asociados a CalmaCat-SafeGuards.
