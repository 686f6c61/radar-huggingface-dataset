# zuxler/qwen2.5-1.5b-indonesian-legal-sft

## Resumen

El modelo `zuxler/qwen2.5-1.5b-indonesian-legal-sft` es un ajuste fino (fine-tune) del modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, que a su vez deriva de Qwen2.5-1.5B-Instruct. Ha sido desarrollado por el usuario zuxler con el objetivo declarado de adaptar un modelo ligero al dominio legal indonesio, aunque la etiqueta de idioma en HuggingFace indica únicamente "en" (inglés), lo que genera cierta ambigüedad sobre el alcance lingüístico real del ajuste.

El modelo conserva la arquitectura Qwen2 (transformer decoder-only) con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y una ventana de contexto de 32.000 tokens heredada del modelo base. Su tamaño reducido lo hace adecuado para despliegues con recursos limitados, como GPUs de consumo o inferencia en CPU. El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que indica un proceso de ajuste supervisado (SFT) optimizado en velocidad, aunque no se han publicado detalles sobre el dataset utilizado ni sobre el método exacto de entrenamiento.

La relevancia de este modelo radica en su potencial para tareas de análisis y respuesta a preguntas sobre textos legales indonesios, un nicho donde existen pocos modelos abiertos específicos. Sin embargo, la ausencia de documentación técnica detallada, benchmarks publicados y ejemplos de uso limita su evaluación objetiva. Es un modelo experimental que requiere validación adicional antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (heredado del base, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se especifica cuantizacion) |
| Idiomas soportados | en (segun etiqueta de HuggingFace; el nombre sugiere indonesio, pero no hay confirmacion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base Qwen2.5-1.5B-Instruct incorpora mejoras sobre la serie Qwen2, como un vocabulario ampliado y un entrenamiento con datos multilingües, aunque el fine-tune aquí presentado declara únicamente inglés como idioma soportado.

El proceso de entrenamiento se realizó mediante ajuste supervisado (SFT) utilizando la librería Unsloth, que optimiza el uso de memoria y velocidad durante el fine-tune, junto con la librería TRL de HuggingFace. El modelo base era una versión cuantizada en 4 bits (bnb-4bit), pero no se especifica si el fine-tune se realizó en precisión completa o manteniendo cuantización. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de Unsloth.

## Capacidades

- Generación de texto conversacional: el modelo base Qwen2.5-1.5B-Instruct está entrenado para seguir instrucciones y mantener diálogos multi-turno, capacidad que se presume preservada en el fine-tune.
- Adaptación al dominio legal indonesio: según el nombre del modelo, está orientado a tareas de análisis y respuesta sobre textos legales de Indonesia, aunque no hay ejemplos ni demostraciones que lo confirmen.
- Soporte de contexto largo: hereda los 32.000 tokens de ventana del modelo base, lo que permite procesar documentos legales extensos.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso explícito, ni capacidades multimodales (visión, audio). Estas capacidades podrían existir si el modelo base las soporta, pero no están confirmadas para este fine-tune.

## Casos de uso

- Análisis de documentos legales indonesios: el modelo puede procesar contratos, leyes o reglamentos en indonesio (si el fine-tune realmente cubre ese idioma) para extraer cláusulas relevantes o resumir contenido, gracias a su ventana de contexto de 32K tokens.
- Asistente de consulta jurídica básica: podría responder preguntas frecuentes sobre normativa indonesia en un entorno de bajo coste, aunque su tamaño limitado restringe la profundidad del razonamiento legal.
- Clasificación de textos legales: útil para etiquetar o categorizar documentos según su tipo (ley, decreto, sentencia) en flujos de trabajo de gestión documental.
- Generación de resúmenes de sentencias o expedientes: con contexto suficiente para documentos de longitud media, puede producir resúmenes concisos para revisión humana.
- Prototipado de chatbots legales: al ser ligero, puede desplegarse en entornos de desarrollo o pruebas para validar flujos conversacionales antes de escalar a modelos mayores.
- Fine-tune adicional sobre dominios específicos: al ser un modelo abierto con licencia Apache 2.0, puede servir como punto de partida para ajustes más especializados en subdominios legales indonesios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares. Un modelo similar (Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia) reporta un MMLU de 45, pero no hay evidencia de que este modelo comparta esos resultados. Se recomienda evaluar el modelo con datos propios antes de cualquier uso.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 mil millones de parámetros en FP16, se requieren aproximadamente 3,1 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a ~1,6 GB, y a 4 bits a ~0,8 GB, aunque no se confirma que el modelo esté disponible en esos formatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para mayor velocidad, una RTX 3060 o superior es suficiente. También puede ejecutarse en CPU con 8 GB de RAM, aunque con latencia mayor.
- Compatibilidad con consumer GPUs: sí, el modelo cabe en GPUs de consumo de gama media y baja.
- Opciones de despliegue: al ser un modelo de la familia Qwen2 con pesos en safetensors, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y HuggingFace Transformers. No se han publicado configuraciones específicas de despliegue.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 1,5B en FP16 puede generar entre 50 y 100 tokens por segundo, pero esto es una estimación general, no un dato verificado para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma declarado | Notas |
|---|---|---|---|---|---|
| zuxler/qwen2.5-1.5b-indonesian-legal-sft | 1,54B | 32K (heredado) | Apache 2.0 | en (etiqueta) | Fine-tune legal indonesio, sin benchmarks |
| attanmhd/qwen-2.5-1.5b-indonesian-legal-sft | 1,54B (presumible) | 32K (presumible) | Apache 2.0 (presumible) | indonesio (por nombre) | Mismo nombre y propósito, autor distinto |
| Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia | 1,54B | 32K | Apache 2.0 (presumible) | indonesio | Reporta MMLU 45, orientado a legal indonesio |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K | Apache 2.0 | multilingüe | Modelo original sin fine-tune legal |

La comparación se basa en datos públicos de HuggingFace y búsquedas web. No hay información suficiente para comparar rendimiento real entre estos modelos, ya que solo uno de ellos (Aziz2010) publica una métrica.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos. Al ser un fine-tune de un modelo base entrenado con datos multilingües, puede heredar sesgos presentes en los datos originales, pero no hay evidencia específica.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en un dominio legal donde la precisión es crítica. El tamaño reducido (1,5B) aumenta este riesgo en tareas complejas.
- Limitaciones de idioma: la etiqueta de idioma en HuggingFace indica "en" (inglés), mientras que el nombre del modelo sugiere indonesio. Esta discrepancia no está aclarada en la model card. Si el fine-tune se realizó con datos en indonesio, el modelo podría no funcionar correctamente en inglés, y viceversa.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia. No hay restricciones adicionales conocidas.
- Carencia de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, el método de SFT, ni ejemplos de uso. Esto dificulta la reproducibilidad y la evaluación de calidad.
- Estado experimental: con 0 descargas y 0 likes en HuggingFace, el modelo no ha sido validado por la comunidad. No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zuxler/qwen2.5-1.5b-indonesian-legal-sft
- Modelo similar de attanmhd: https://huggingface.co/attanmhd/qwen-2.5-1.5b-indonesian-legal-sft
- Modelo similar de Aziz2010 (con benchmark MMLU): https://openmodelmap.com/model/Aziz2010/Qwen2.5-1.5B-sft-hukum-indonesia
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
