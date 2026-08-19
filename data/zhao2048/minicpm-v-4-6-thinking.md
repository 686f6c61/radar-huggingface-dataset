# zhao2048/MiniCPM-V-4.6-Thinking

## Resumen

MiniCPM-V 4.6 Thinking es la variante de razonamiento de MiniCPM-V 4.6, un modelo de lenguaje multimodal (MLLM) ligero desarrollado por el equipo de OpenBMB, pensado para ejecutarse en dispositivos de borde como teléfonos móviles. A diferencia de la versión instruct, esta variante genera una cadena de razonamiento explícita (chain-of-thought) antes de producir la respuesta final, lo que mejora sustancialmente el rendimiento en tareas complejas de razonamiento multimodal, matemáticas y OCR. El modelo combina un codificador visual SigLIP2 de 400 millones de parámetros con un LLM Qwen3.5 de 0.8 mil millones, sumando un total de aproximadamente 1.300 millones de parámetros, lo que lo convierte en uno de los modelos multimodales más compactos con capacidad de razonamiento.

La relevancia actual de este modelo reside en su capacidad para ofrecer razonamiento avanzado en dispositivos con recursos limitados, manteniendo una arquitectura eficiente con compresión de tokens visuales mixta (4x y 16x). Se puede desplegar en iOS, Android y HarmonyOS, y también se ofrece un servicio API público gratuito. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su adopción en productos y servicios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision encoder) + Qwen3.5-0.8B (LLM), transformer multimodal |
| Parametros totales | 1.300.428.016 (~1.3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente multilingue, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 Thinking utiliza una arquitectura multimodal compuesta por un codificador visual SigLIP2 de 400 millones de parámetros y un modelo de lenguaje Qwen3.5 de 0.8 mil millones de parámetros, conectados mediante un proyector que aplica una compresión de tokens visuales mixta de 4x y 16x. Esta compresión permite reducir drásticamente el número de tokens visuales procesados, lo que resulta clave para la eficiencia en dispositivos de borde. La variante Thinking se distingue por generar un razonamiento explícito paso a paso antes de la respuesta final, similar a los modos de pensamiento de otros modelos, lo que mejora la precisión en tareas que requieren inferencia multi-paso.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en la información disponible. El modelo se basa en la arquitectura de MiniCPM-V 4.6, que ya incorpora innovaciones como el soporte para video y la optimización para despliegue en móviles. La inferencia se realiza mediante la librería transformers (versión >= 5.7.0) y requiere torchvision y torchcodec (o PyAV como alternativa) para el procesamiento de video.

## Capacidades

- Generación de texto y razonamiento multimodal: produce respuestas textuales basadas en entradas de imagen y video.
- Razonamiento de cadena de pensamiento (thinking mode): genera un razonamiento explícito antes de la respuesta final, mejorando el rendimiento en tareas complejas.
- Comprensión de imágenes: análisis de fotografías, documentos, diagramas y escenas visuales con alta resolución mediante el modo de subimágenes (max_slice_nums).
- Comprensión de video: procesa secuencias de video para responder preguntas sobre su contenido.
- OCR y extracción de texto: capacidades destacadas para tareas de reconocimiento óptico de caracteres.
- Matemáticas y razonamiento lógico: rendimiento mejorado en problemas matemáticos multimodales gracias al razonamiento explícito.
- Despliegue en dispositivos de borde: compatible con iOS, Android y HarmonyOS, con inferencia local en el dispositivo.
- Servicio API: disponible una API pública gratuita para integración remota.

## Casos de uso

- Asistente visual en tiempo real para móviles: el modelo puede analizar la cámara del dispositivo y responder preguntas sobre objetos, escenas o textos en tiempo real, gracias a su tamaño reducido y su capacidad de ejecución local en iOS, Android y HarmonyOS.
- Digitalización y OCR de documentos: extracción de texto de facturas, tickets, tarjetas de visita o páginas escaneadas, con razonamiento para interpretar el contexto (por ejemplo, calcular totales o extraer fechas).
- Accesibilidad para personas con discapacidad visual: descripción de imágenes y escenas capturadas con el móvil, generando explicaciones detalladas y respondiendo a preguntas sobre el entorno.
- Educación y tutoría matemática: resolución de problemas matemáticos presentados como imágenes (ecuaciones, gráficos, ejercicios), mostrando el razonamiento paso a paso para facilitar el aprendizaje.
- Análisis de video para soporte remoto: un técnico puede grabar un vídeo de un equipo averiado y el modelo identifica el problema, sugiere reparaciones o extrae información relevante de etiquetas o manuales visibles.
- Moderación de contenido visual: análisis de imágenes y vídeos para detectar contenido inapropiado, texto no deseado o elementos visuales específicos, con capacidad de explicar el motivo de la clasificación.
- Asistente de compras y comparación de productos: el usuario fotografía un producto y el modelo identifica el artículo, extrae el precio, compara características o sugiere alternativas basándose en el razonamiento multimodal.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la informacion disponible. La model card incluye gráficos de rendimiento general (thinking e instruct) y de eficiencia de inferencia (throughput y TTFT), pero los valores concretos no son accesibles en texto. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.3B parámetros, es compatible con GPUs de consumo. Con cuantización de 4 bits (no publicada oficialmente, pero posible mediante herramientas como llama.cpp o AutoGPTQ), la VRAM estimada sería de 1-2 GB; en 8 bits, de 2-3 GB; en precisión completa (fp16), alrededor de 2.6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3060, RTX 4060) es suficiente para inferencia en fp16. Para mayor velocidad, se recomienda una RTX 4090 o A100 en entornos de servidor.
- Diseñado para ejecutarse en dispositivos móviles: puede correr en CPU de gama media y en los NPU/GPU de los SoC de iPhone, Redmi y HUAWEI, como se demuestra en las demostraciones oficiales.
- Opciones de despliegue: transformers (con Flash Attention 2 recomendado), vLLM, TGI, o mediante el servicio API oficial. Para móviles, se proporcionan paquetes específicos para iOS, Android y HarmonyOS.
- Latencia y throughput: no se dispone de datos numéricos en la información proporcionada, aunque los gráficos de eficiencia sugieren una alta concurrencia y bajo TTFT en entornos servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking | 1.3B | no disponible | SigLIP2-400M + Qwen3.5-0.8B | Apache 2.0 | HuggingFace, API |
| MiniCPM-V 4.6 (Instruct) | 1.3B | no disponible | SigLIP2-400M + Qwen3.5-0.8B | Apache 2.0 | HuggingFace |
| Qwen2-VL-2B | 2B | 32K tokens | Vision transformer + Qwen2 | Apache 2.0 | HuggingFace |
| Phi-3.5-vision | 4.2B | 128K tokens | Transformer multimodal | MIT | HuggingFace |

La comparativa se basa en datos públicos de los modelos mencionados. MiniCPM-V 4.6 Thinking se distingue por su menor tamaño y su enfoque en razonamiento explícito, mientras que alternativas como Qwen2-VL-2B ofrecen mayor contexto pero sin modo de razonamiento dedicado. No se dispone de benchmarks comparativos fiables en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede presentar sesgos sociales, culturales o de género similares a otros LLM.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en tareas de razonamiento complejo donde el razonamiento explícito puede amplificar errores si la cadena de pensamiento se desvía.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque probablemente sea multilingüe, el rendimiento puede variar entre idiomas.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto máxima, lo que puede limitar su uso en tareas que requieran procesar documentos largos o múltiples imágenes.
- Compatibilidad de video: la inferencia de video depende de torchcodec, que puede tener problemas de compatibilidad con ciertas versiones de CUDA; se recomienda usar PyAV como alternativa.
- Dependencia de versiones recientes: requiere transformers >= 5.7.0, lo que puede no estar disponible en todos los entornos.
- El repositorio en HuggingFace (zhao2048/MiniCPM-V-4.6-Thinking) tiene 0 descargas y 0 likes, lo que sugiere que podría ser un espejo no oficial; se recomienda verificar la autenticidad del modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/zhao2048/MiniCPM-V-4.6-Thinking
- Repositorio original (OpenBMB): https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-o
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-Demo
- Documentación de la API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Paper (razonamiento): arxiv:2604.27393
- Paper (MiniCPM-V 4.6): arxiv:2509.18154
- Paper (MiniCPM-V): arxiv:2408.01800
- Paper (optimización): arxiv:2605.08985
