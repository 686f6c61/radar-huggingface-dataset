# Syradevops/Selene-Rebel-08-4B-Instruct

## Resumen

Selene-Rebel-08-4B-Instruct es un ajuste fino (finetune) del modelo Syradevops/Selene-Rebel-4B-Instruct, a su vez derivado de la familia Gemma 3 de Google. Lo publica el usuario Syradevops en Hugging Face bajo licencia Apache 2.0 y esta orientado a tareas conversacionales multimodales de imagen y texto (pipeline image-text-to-text). Cuenta con 4.300.079.472 parametros totales segun los pesos en safetensors y un tamano de repositorio de 8,6 GB.

El modelo se presenta como un ajuste realizado con Unsloth y la libreria TRL de Hugging Face, lo que el autor describe como un entrenamiento "2x mas rapido". La model card es extremadamente escueta: no documenta el dataset de ajuste, el numero de tokens de entrenamiento, la composicion de datos ni los hiperparametros empleados, por lo que la mayor parte de las especificaciones tecnicas deben inferirse de la arquitectura base (Gemma 3 4B) o marcarse como no disponibles.

Su relevancia practica es limitada por el momento: apenas 39 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentacion adicional. Resulta util como ejemplo de pipeline de ajuste ligero con Unsloth sobre un modelo multimodal pequeno, pero no como una alternativa consolidada en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (familia Gemma 3), segun tags del repo |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 4B parametros, un transformer decoder-only con capacidades multimodales de entrada imagen-texto, tal como reflejan los tags `gemma3` e `image-text-to-text`. El ajuste se realizo sobre Syradevops/Selene-Rebel-4B-Instruct, que a su vez es un finetune del modelo base de la familia. No se dispone de informacion sobre la configuracion exacta de capas, dimensiones ocultas ni mecanismos de atencion empleados en esta variante concreta.

En cuanto al entrenamiento, la unica informacion disponible es que se utilizo Unsloth junto con TRL de Hugging Face, lo que sugiere un ajuste supervisado (SFT) o posiblemente DPO sobre el modelo previo, con optimizaciones de memoria y velocidad propias de Unsloth. No se documenta el volumen de tokens, la composicion del dataset, la existencia de RLHF, ni ninguna innovacion tecnica adicional. Tampoco se especifica si se congelaron capas del encoder visual o si se ajusto el proyector multimodal.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato instruct.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), heredado de Gemma 3.
- Razonamiento basico y respuesta a instrucciones, segun el formato instruct del modelo base.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, audio, vision avanzada): solo vision por herencia de la familia Gemma 3; el resto no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales multimodales: el modelo acepta pares imagen-texto, por lo que puede emplearse para describir imagenes o responder preguntas sobre ellas en fase de prueba, aunque sin garantias de calidad documentadas.
- Experimentacion con pipelines de ajuste Unsloth: sirve como referencia practica para reproducir el flujo de finetune sobre un modelo de 4B con recursos modestos.
- Generacion de descripciones de imagenes en ingles: util en tareas de etiquetado o accesibilidad donde el volumen no sea critico y se pueda validar manualmente la salida.
- Chatbot de dominio acotado en ingles: al ser un modelo pequeno, puede desplegarse en entornos con VRAM limitada para conversaciones de soporte simples.
- Educacion e investigacion: base para estudiar el efecto de finetunes sucesivos sobre modelos Gemma 3, dado que se conoce el linaje completo.
- Evaluacion comparativa de cuantizaciones: al ser un modelo de 4B en safetensors, permite medir el impacto de cuantizar a 8 o 4 bits en tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3-4 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para inferencia en BF16.
- GPU consumer: cabe en RTX 4070 Ti (12 GB) en BF16 con margen ajustado, y en RTX 3060 (12 GB) o inferiores solo con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan GGUF oficiales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Selene-Rebel-08-4B-Instruct | 4,3 B | no disponible | Apache 2.0 | Si (imagen-texto) | Hugging Face, 39 descargas |
| Gemma 3 4B Instruct (Google) | ~4 B | no disponible en esta ficha | Gemma Terms | Si (imagen-texto) | Hugging Face, ampliamente usado |
| Qwen2.5-VL 3B | ~3 B | no disponible en esta ficha | Apache 2.0 | Si (imagen-texto) | Hugging Face |
| Phi-3.5-vision | ~4,2 B | no disponible en esta ficha | MIT | Si (imagen-texto) | Hugging Face |

La comparativa se limita a datos de familia; no se dispone de resultados de benchmarks del modelo evaluado que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Model card practicamente vacia: sin dataset, sin hiperparametros, sin evaluacion, lo que impide verificar la calidad del ajuste.
- Riesgo elevado de alucinacion y de degradacion respecto al modelo base por sobreajuste a un dataset no documentado.
- Soporte unicamente en ingles; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Sin benchmarks publicados ni evaluaciones independientes; no apto para produccion sin validacion previa.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma 3 esta sujeto a los terminos de uso de Google; conviene revisar la compatibilidad para uso comercial.
- Trazabilidad limitada: el linaje incluye un finetune intermedio (Selene-Rebel-4B-Instruct) del que tampoco se documenta el proceso.
- Numero de descargas muy bajo (39) y sin comunidad: escasa probabilidad de soporte o correccion de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Syradevops/Selene-Rebel-08-4B-Instruct
- Modelo base: https://huggingface.co/Syradevops/Selene-Rebel-4B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Gemma 3 (Google): https://huggingface.co/google/gemma-3-4b-it
