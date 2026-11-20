# usermma/Quark-270m-Base-i1-GGUF

## Resumen

Quark-270m-Base-i1-GGUF es una cuantización en formato GGUF del modelo ThingAI/ARK-270M-Base, publicada por el usuario usermma. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a GGUF realizada con llama.cpp (etiqueta gguf-my-repo) para facilitar su despliegue en entornos de inferencia local. El modelo subyacente es un causal-LM bilingüe italiano-inglés entrenado desde cero, con 251.749.120 parámetros reales según los pesos safetensors del modelo base.

Su relevancia radica en el tamaño: con unos 270 millones de parámetros nominales (251,7 millones reales), es un modelo pequeño que puede ejecutarse en hardware muy modesto, incluso en CPU, y que está pensado para tareas de generación de texto en italiano e inglés. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para prototipos, experimentación y despliegues con recursos limitados.

La información pública disponible es escasa: la model card del repositorio es una plantilla genérica de conversión a GGUF y no incluye detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni longitud de contexto. Los datos técnicos que se presentan a continuación proceden de los metadatos de Hugging Face y de la model card del autor, y se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (detalle interno no disponible) |
| Parametros totales | 251.749.120 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`) |
| Tipos de cuantizacion | GGUF; se menciona explícitamente IQ1_S (imatrix). Otras variantes no detalladas en la información disponible |
| Idiomas soportados | Italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base ThingAI/ARK-270M-Base es un causal-LM entrenado desde cero (etiqueta trained-from-scratch) y bilingüe italiano-inglés. No se dispone de información pública en la documentación proporcionada sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (MHA, GQA, MQA), función de activación ni normalización utilizada. Tampoco se detalla si emplea embeddings atados, RoPE u otra codificación posicional.

En cuanto al entrenamiento, no se especifican el número de tokens, la composición del dataset, ni si hubo fases de instrucción, RLHF o DPO. La model card del repositorio GGUF es una plantilla estándar de conversión y no aporta información sobre el proceso de entrenamiento. La única innovación técnica documentada es el uso de cuantización IQ1_S con imatrix (matriz de importancia) para preservar la calidad en un régimen de cuantización muy agresivo, lo que permite reducir el peso del modelo a un tamaño mínimo para inferencia en hardware restringido.

## Capacidades

- Generación de texto causal en italiano e inglés, con etiqueta bilingual y small-language-model.
- Modelo base (no instruct): no se ha documentado un ajuste por instrucciones, por lo que su uso esperado es la continuación de texto y el preentrenamiento, no el diálogo directo.
- Capacidad multilingüe limitada a italiano e inglés según los metadatos de idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- Compatible con endpoints (etiqueta endpoints_compatible) y con el ecosistema llama.cpp.

## Casos de uso

- Prototipado rápido de generación de texto en italiano: al ser un modelo de 251,7 millones de parámetros con licencia Apache 2.0, permite validar pipelines de generación en local sin coste de API y con muy baja huella de memoria.
- Experimentación académica con modelos pequeños entrenados desde cero: sirve como línea base para comparar técnicas de entrenamiento o de cuantización en un régimen de parámetros reducido.
- Despliegue en dispositivos de borde o CPU: la variante IQ1_S reduce el peso a un tamaño mínimo, lo que permite ejecutar inferencia en máquinas sin GPU dedicada mediante llama.cpp.
- Filtrado y clasificación de texto en italiano e inglés: la generación condicionada permite construir clasificadores zero-shot o few-shot sencillos en entornos con recursos limitados.
- Generación de texto auxiliar en aplicaciones de autocompletado o sugerencia de frases en italiano, donde un modelo pequeño con baja latencia es preferible a uno grande.
- Evaluación de la calidad de cuantizaciones agresivas: el repositorio sirve para estudiar el impacto de IQ1_S con imatrix frente a otras cuantizaciones en un modelo bilingüe pequeño.
- Base para fine-tuning ligero: al ser un modelo base con licencia permisiva, puede adaptarse a dominios concretos con LoRA en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 251,7 millones de parámetros en cuantización IQ1_S ocupa del orden de cientos de megabytes, por lo que cabe holgadamente en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, e incluso en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), según los ejemplos de la model card; también es compatible con el ecosistema transformers por el modelo base, y con herramientas que consuman GGUF (Ollama, etc., aunque no se documentan explícitamente en la información disponible).
- Latencia y throughput estimados: no disponibles. La model card sugiere `-c 2048` como ventana de contexto en los ejemplos, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Quark-270m-Base-i1-GGUF | 251,7 M | no disponible (ejemplos con 2048) | it, en | Apache 2.0 | GGUF |
| ThingAI/ARK-270M-Base | 251,7 M | no disponible | it, en | Apache 2.0 | safetensors |
| Alternativas de ~250-300 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (small language models bilingües italiano-inglés entrenados desde cero) en la documentación proporcionada, por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no debe esperarse un comportamiento conversacional ni de seguimiento de instrucciones sin fine-tuning adicional.
- Información técnica muy limitada: se desconocen arquitectura interna, datos de entrenamiento, contexto máximo real y procedimiento de alineación.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños y a los modelos base; la falta de alineación puede agravar este comportamiento.
- Cobertura lingüística restringida a italiano e inglés; no se documenta soporte de castellano.
- La cuantización IQ1_S es extremadamente agresiva y puede degradar la calidad frente al modelo original en safetensors; conviene validar la salida antes de usarla en producción.
- La model card indica explícitamente que el repositorio no está hecho por el autor original del modelo, sino que es solo una cuantización; la responsabilidad sobre el modelo subyacente recae en ThingAI.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la licencia y las condiciones del modelo base original antes de un despliegue en producción.
- No se documentan salvaguardas de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/usermma/Quark-270m-Base-i1-GGUF
- Modelo base: https://huggingface.co/ThingAI/ARK-270M-Base
- llama.cpp (repositorio y guía de uso): https://github.com/ggerganov/llama.cpp
- Pasos de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
