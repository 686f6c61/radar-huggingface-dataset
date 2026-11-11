# toiar/Ri-Gemma-E2B-IT-Khasi-Chatbot-v2

## Resumen

Ri-Gemma-E2B-IT-Khasi-Chatbot-v2 es un ajuste fino (fine-tuning) del modelo Gemma 4 E2B IT en su variante QAT q4_0 desquantizada, desarrollado por el usuario toiar. Su proposito es dotar a un modelo base de gran capacidad de un chatbot conversacional funcional en khasi, una lengua austroasiatica de baja资源 hablada principalmente en Meghalaya (India). El modelo parte de los pesos de Unsloth y se ha entrenado con datos sinteticos para tareas de conversacion, traduccion y razonamiento bilingue khasi-ingles.

Con 5.104.297.504 parametros totales (aproximadamente 5,1 mil millones), el modelo hereda la arquitectura multimodal image-text-to-text de la familia Gemma 4, lo que le permite procesar imagenes ademas de texto. La ficha tecnica del autor no detalla la longitud de contexto, los datos de entrenamiento ni los resultados de evaluacion, por lo que muchos apartados de esta ficha quedan marcados como no disponibles.

El modelo es relevante por su enfoque en una lengua de bajos recursos dentro de un ecosistema dominado por el ingles y unas pocas lenguas mayoritarias, y por emplear datos sinteticos como estrategia de aumento de corpus. No obstante, su acceso esta restringido (gated) en Hugging Face y su adopcion es practicamente nula (2 descargas, 0 likes en el momento de la consulta), lo que limita la evidencia empirica sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4; detalles no disponibles |
| Parametros totales | 5.104.297.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base es QAT q4_0 desquantizado; el repo publica safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | khasi (kha), ingles (en) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E2B IT, la variante instruct de la familia Gemma 4 de Google, en su version quantized-aware training (QAT) q4_0 que Unsloth publica desquantizada para permitir ajuste fino posterior. La arquitectura subyacente es un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text), aunque la informacion proporcionada no detalla el numero de capas, dimensiones ocultas, mecanismos de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

El ajuste fino se ha realizado sobre datos sinteticos orientados a conversacion, traduccion y razonamiento en khasi e ingles, segun los tags del repositorio (synthetic-data, instruction-tuning, low-resource-language, translation, reasoning). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO o preference optimization. Tampoco se documenta el metodo de ajuste (LoRA, QLoRA o full fine-tuning) ni los hiperparametros utilizados.

## Capacidades

- Generacion de texto conversacional en khasi e ingles, con soporte de dialogos multi-turno.
- Traduccion entre khasi e ingles, segun los tags de translation del repositorio.
- Razonamiento (reasoning) y respuesta a instrucciones (instruction-tuning).
- Procesamiento de imagen y texto (image-text-to-text), heredado de la familia Gemma 4; el alcance real de esta capacidad tras el ajuste no esta documentado.
- Capacidades multilingues limitadas a los dos idiomas declarados (kha, en).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio especial: no disponible (la vision se infiere de la arquitectura base, sin confirmacion documental).

## Casos de uso

- Atencion al cliente en khasi: el modelo puede gestionar conversaciones multi-turno en khasi para negocios locales de Meghalaya, aunque la ausencia de datos sobre longitud de contexto impide garantizar ventanas largas.
- Traduccion khasi-ingles en entornos administrativos: util para traducir documentos, formularios o comunicaciones oficiales entre ambos idiomas, aprovechando el ajuste especifico en traduccion.
- Preservacion linguistica y educacion: generacion de material didactico, ejercicios y textos de practica en khasi para escuelas y programas de revitalizacion linguistica.
- Asistencia conversacional para hablantes de khasi: chatbot de proposito general que responde en su lengua materna, reduciendo la dependencia de modelos solo en ingles.
- Investigacion en lenguas de bajos recursos: punto de partida para experimentos de ajuste fino, aumento de datos sinteticos y evaluacion de modelos multilingues en khasi.
- Prototipado de aplicaciones bilingues khasi-ingles: integracion en pipelines de transformers para demos de traduccion o chat, dado que el modelo es compatible con la libreria transformers y con endpoints compatibles.
- Analisis de imagenes con contexto textual en khasi: si la capacidad multimodal se conserva tras el ajuste, podria emplearse para describir imagenes o responder preguntas visuales en khasi, aunque no hay evidencia publicada de ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.104.297.504 parametros, en precision completa (fp32) se requieren aproximadamente 20,4 GB; en bf16/fp16, unos 10,2 GB; en cuantizacion de 8 bits, unos 5,1 GB; en 4 bits, unos 2,6 GB (estimaciones teoricas a partir del numero de parametros, sin incluir overhead de activaciones ni cache KV).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) permitiria inferencia en bf16 con margen; una GPU de 8-12 GB requeriria cuantizacion.
- Compatibilidad con GPU de consumo: probable en tarjetas de 8 GB o mas si se aplica cuantizacion de 4-8 bits; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ri-Gemma-E2B-IT-Khasi-Chatbot-v2 | 5.104.297.504 | no disponible | kha, en | Gemma | Gated en Hugging Face |
| Gemma 4 E2B IT (base) | no disponible | no disponible | multilingue | Gemma | Publico en Hugging Face |
| Otros ajustes en khasi de tamano similar | no disponible | no disponible | kha, en | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos especificos para khasi en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos, lo que complica la reproducibilidad y el despliegue automatico.
- Adopcion practicamente nula (2 descargas, 0 likes): no hay evidencia de uso en produccion ni validacion independiente de su calidad.
- Entrenamiento con datos sinteticos: existe riesgo de que el modelo reproduzca errores, sesgos o artefactos de los datos generados, especialmente en una lengua de bajos recursos.
- Riesgo de alucinacion: no cuantificado; en lenguas de bajos recursos la cobertura del corpus suele ser limitada y aumenta la probabilidad de respuestas incorrectas.
- Limitaciones de contexto e idioma: solo se declaran khasi e ingles; el rendimiento fuera de estos idiomas no esta documentado. La longitud de contexto no se especifica.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial y de redistribucion que deben revisarse antes de desplegar el modelo en produccion.
- Falta de documentacion tecnica: no se detallan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas, lo que dificulta la evaluacion rigurosa.
- Capacidad multimodal no confirmada tras el ajuste: aunque el pipeline es image-text-to-text, no hay evidencia de que el fine-tuning haya preservado la calidad en tareas de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toiar/Ri-Gemma-E2B-IT-Khasi-Chatbot-v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
