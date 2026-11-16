# speakleash/Bielik-Minitron-7B-v3.0-Instruct-MLX-4bit

## Resumen
Bielik-Minitron-7B-v3.0-Instruct-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, el proyecto polaco de IA abierta. El modelo base es un transformer decoder-only de tipo Llama con 7.477.727.232 parámetros, afinado para instrucciones y orientado a un uso multilingüe con especial énfasis en polaco e inglés, aunque cubre 33 idiomas europeos. Esta variante concreta está pensada para inferencia eficiente en hardware Apple Silicon mediante el framework MLX.

La relevancia de esta ficha radica en que combina un modelo instructivo de tamaño medio (7B) con una cuantización de 4 bits que reduce el peso del repositorio a 4,7 GB, lo que permite ejecutarlo en equipos con memoria unificada moderada. La licencia Apache 2.0 facilita su adopción comercial sin las restricciones típicas de otros modelos abiertos.

No se dispone de información sobre el pipeline declarado, benchmarks publicados ni detalles del entrenamiento en la información proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 7.477.727.232 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX), pesos cuantizados |
| Idiomas soportados | Multilingüe: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (4-bit) |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only de la familia Llama, con 7.477.727.232 parámetros totales según los safetensors del repositorio. Esta variante es una cuantización a 4 bits realizada con MLX, el framework de Apple para ejecutar modelos en chips de la serie M. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones de alineación en el modelo base. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

La model card únicamente indica que se trata de una versión cuantizada de `speakleash/Bielik-Minitron-7B-v3.0-Instruct`, con revisión de origen `5808ff03c95122d05cb860d11ba75b1efad98380`, y que el formato es MLX 4-bit. No se detalla el método exacto de cuantización (por ejemplo, group size, calibración o si se cuantizaron todas las capas).

## Capacidades
- Generación de texto instructivo y conversacional en 33 idiomas europeos, con especial cobertura del polaco y el inglés.
- Razonamiento general y respuesta a instrucciones, al ser una variante Instruct del modelo base.
- Capacidades multilingües amplias: incluye lenguas eslavas (pl, cs, sk, sl, hr, sr, bs, bg, ru, uk, bel), germánicas (en, de, nl, da, sv, no, is), románicas (es, fr, it, pt, ro), bálticas (lt, lv, et), además de albanés, griego, húngaro y turco.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.
- Ejecución optimizada en Apple Silicon mediante MLX, lo que permite inferencia local en macOS.

## Casos de uso
- Asistente conversacional multilingüe en local: el modelo puede gestionar diálogos multi-turno en cualquiera de los 33 idiomas soportados, lo que lo hace adecuado para aplicaciones de escritorio en macOS que requieran privacidad y no dependan de la nube.
- Procesamiento de texto en lenguas europeas minoritarias: útil para tareas de resumen, reescritura o clasificación en polaco, checo, esloveno, letón o albanés, idiomas con menor cobertura en modelos comerciales.
- Generación de contenido en polaco: al ser un modelo de SpeakLeash, está orientado al ecosistema lingüístico polaco, por lo que resulta adecuado para redacción, traducción y adaptación de textos en ese idioma.
- Prototipado rápido en equipos Apple: gracias al formato MLX 4-bit y sus 4,7 GB, se puede desplegar en un Mac con memoria unificada para pruebas de concepto sin infraestructura GPU dedicada.
- Traducción asistida entre lenguas eslavas y germánicas: el amplio conjunto de idiomas declarados permite usarlo como base para pipelines de traducción automática de baja latencia en local.
- Educación y análisis de documentos: puede emplearse para responder preguntas sobre textos largos en varios idiomas, siempre que se verifique la longitud de contexto real del modelo base (no disponible en esta ficha).
- Investigación en eficiencia de cuantización: sirve como referencia para estudiar el impacto de la cuantización 4-bit MLX en la calidad de un modelo instructivo de 7B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/memoria estimada: el repositorio pesa 4,7 GB en 4-bit, por lo que se necesita al menos ~5-6 GB de memoria unificada para cargar los pesos, más overhead de contexto y KV cache.
- GPU recomendadas: al ser formato MLX, está diseñado para Apple Silicon (series M1, M2, M3, M4). No es compatible de forma nativa con CUDA sin conversión previa.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí: cabe en Mac con 8 GB de memoria unificada o superior, aunque 16 GB es recomendable para contextos largos.
- Opciones de despliegue: MLX (mlx-lm) en macOS. Para otros entornos sería necesario convertir los pesos a GGUF (llama.cpp/Ollama) o a safetensors estándar (vLLM, TGI), lo cual no se documenta en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-MLX-4bit | 7,48B | No disponible | Apache 2.0 | MLX 4-bit | Variante cuantizada para Apple Silicon |
| Bielik-Minitron-7B-v3.0-Instruct | 7,48B | No disponible | Apache 2.0 | Safetensors | Modelo base sin cuantizar |
| Llama 3.1 8B Instruct | ~8B | 128K (según documentación pública) | Llama 3.1 Community License | Safetensors, GGUF | Referencia general; cobertura multilingüe menor en lenguas eslavas |
| Mistral 7B Instruct | ~7,2B | 32K (según documentación pública) | Apache 2.0 | Safetensors, GGUF | Alternativa europea con licencia permisiva |

La comparación con Llama 3.1 y Mistral se incluye como referencia de categoría; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos polacos e ingleses, puede presentar sesgos culturales y lingüísticos en otros idiomas.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de razonamiento complejo o en idiomas con menor representación en el entrenamiento.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo base, especialmente en tareas que requieren precisión numérica o generación de código.
- No se dispone de información sobre la longitud de contexto real, lo que limita la planificación de aplicaciones con documentos largos.
- El formato MLX restringe el despliegue a hardware Apple Silicon; para producción en GPU NVIDIA sería necesaria una conversión no documentada.
- Aunque la licencia es Apache 2.0, se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- El repositorio no incluye pipeline declarado ni ejemplos de uso, lo que dificulta la integración sin consultar la documentación de MLX.

## Enlaces
- Hugging Face: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Proyecto SpeakLeash: no disponible en la información proporcionada
- Paper o blog técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
