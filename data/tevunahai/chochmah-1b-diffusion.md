# TevunahAi/Chochmah-1B-Diffusion

## Resumen

Chochmah-1B-Diffusion es un modelo de difusion para generacion de texto desarrollado por TevunahAi, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de aproximadamente 1.183 millones de parametros (1,18B) que emplea una arquitectura de difusion en lugar del paradigma autorregresivo convencional, identificada con la etiqueta `chochmah-diffusion` y que requiere codigo personalizado (`custom_code`) para su carga y ejecucion.

El modelo resuelve el problema de la generacion de texto no autorregresiva: en lugar de predecir el siguiente token de forma secuencial, los modelos de difusion generan texto mediante un proceso iterativo de eliminacion de ruido sobre la secuencia completa. Esta aproximacion permite, en principio, tecnicas de generacion paralela y control global sobre la salida, lo que resulta relevante para investigacion en alternativas a los transformers autorregresivos clasicos.

La informacion publicada es muy escasa: la model card practicamente se limita a declarar la licencia Apache 2.0, sin detallar arquitectura interna, datos de entrenamiento, contexto, idiomas ni resultados de evaluacion. El repositorio ocupa 2,4 GB y los pesos estan en formato safetensors, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion para texto (etiqueta `chochmah-diffusion`, requiere `custom_code`) |
| Parametros totales | 1.183.031.296 (1,18B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,4 GB |
| Pipeline declarado | no disponible |
| Region | us |

## Arquitectura y entrenamiento

La etiqueta `chochmah-diffusion` y el requisito de `custom_code` indican que el modelo no se carga con las clases estandar de transformers, sino que depende de codigo propio del autor para definir su arquitectura y su proceso de inferencia. Por la nomenclatura, se trataría de un modelo de difusion discreta para texto, en la linea de propuestas como Diffusion-LM o los modelos de difusion de tokens, donde el ruido se aplica sobre embeddings o sobre tokens y la red aprende a revertir el proceso en varias iteraciones.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). Con 1,18B parametros y pesos safetensors de 2,4 GB, los pesos parecen almacenados en precision de 16 bits (fp16/bf16), lo que es coherente con el recuento de parametros.

## Capacidades

- Generacion de texto mediante difusion iterativa (eliminacion de ruido sobre la secuencia), no mediante decodificacion autorregresiva token a token.
- Generacion potencialmente paralela de tokens, sujeta a la implementacion concreta del sampler del autor.
- Razonamiento, codigo, matematicas y vision: no disponible (no hay evidencia en la informacion publicada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en modelos de difusion para texto: util como base para experimentar con samplers, schedules de ruido y estrategias de generacion paralela, gracias a su tamano reducido (1,18B) y licencia Apache 2.0.
- Prototipado de generacion no autorregresiva: permite comparar calidad y latencia frente a modelos autorregresivos de tamano similar en entornos de laboratorio.
- Fine-tuning experimental: con 1,18B parametros puede ajustarse en GPUs de gama alta consumer, sirviendo para estudiar adaptaciones de difusion a dominios concretos.
- Educacion e investigacion academica: modelo pequeno y de licencia permisiva para cursos y trabajos sobre generacion de texto alternativa.
- Generacion controlada globalmente: la difusion permite, en principio, imponer restricciones sobre la secuencia completa (longitud, formato), util en tareas de rellenado o edicion de texto.
- Base para ablaciones: comparar difusion frente a transformers autorregresivos del mismo orden de parametros en tareas de generacion condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,5-3 GB solo para pesos, mas memoria para activaciones y buffers del sampler de difusion (el total depende del numero de pasos e implementacion).
- Cuantizacion: no disponible; al no documentarse formatos GGUF/AWQ/GPTQ, no se puede garantizar su disponibilidad.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia poder alojar los pesos; para lotes grandes o muchos pasos de difusion conviene A100/H100.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs modernas con 6-8 GB, aunque la implementacion `custom_code` puede imponer requisitos adicionales no documentados.
- Opciones de despliegue: al requerir `custom_code`, vLLM, TGI, llama.cpp u Ollama probablemente no lo soportan de forma nativa; la via esperada es cargarlo con `trust_remote_code=True` en transformers o con el codigo del autor.
- Latencia y throughput: no disponible; en difusion dependen criticamente del numero de pasos de eliminacion de ruido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chochmah-1B-Diffusion | 1,18B | no disponible | difusion para texto | Apache 2.0 | Hugging Face, requiere custom_code |
| Modelos autorregresivos ~1B (p. ej. TinyLlama, Qwen2.5-1.5B) | ~1-1,5B | 2k-32k tipicamente | transformer autorregresivo | Apache 2.0 / otras | amplia, ecosistema maduro |
| Modelos de difusion para texto de referencia (Diffusion-LM, Plaid) | variable | no disponible | difusion discreta | variable | investigacion |

La comparativa con alternativas concretas es limitada porque no hay datos de rendimiento del modelo. Frente a los autorregresivos de tamano similar, la diferencia clave es el paradigma de generacion y la madurez del ecosistema de despliegue, muy superior en los autorregresivos.

## Limitaciones y advertencias

- Informacion practicamente inexistente: sin model card detallada, sin benchmarks, sin idiomas declarados y con 0 descargas, lo que impide validar calidad o estabilidad.
- Requiere `custom_code`: la carga depende de codigo del autor, con riesgo de incompatibilidades con versiones de transformers y de problemas de seguridad al ejecutar codigo remoto.
- Riesgo de alucinacion: inherente a modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: desconocidos, al no documentarse datos de entrenamiento ni composicion del corpus.
- Idioma: no se declaran idiomas soportados; no hay garantia de buen rendimiento en castellano.
- Contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Produccion: no recomendado sin evaluacion propia previa, dado el estado incipiente del modelo y la falta de soporte en frameworks de serving.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar que el `custom_code` incluido este cubierto por la misma licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TevunahAi/Chochmah-1B-Diffusion
- Perfil del autor: https://huggingface.co/TevunahAi
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
