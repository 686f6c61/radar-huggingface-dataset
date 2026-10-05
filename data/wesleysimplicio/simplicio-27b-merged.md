# wesleysimplicio/Simplicio-27B-merged

## Resumen

Simplicio-27B-merged es un modelo de lenguaje publicado en HuggingFace por el usuario wesleysimplicio, resultado de un ajuste fino sobre `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`. Cuenta con 27.781.427.952 parametros (~27,8 mil millones), un repositorio de 55,6 GB en formato safetensors y licencia Apache 2.0. La etiqueta de pipeline es `image-text-to-text`, lo que indica que acepta entradas de imagen y texto, aunque la model card no documenta el componente de vision.

El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, segun la unica frase tecnica que aparece en la model card. No se especifican el dataset, el numero de tokens de entrenamiento, el metodo de alineacion (RLHF, DPO u otros) ni la longitud de contexto soportada. El nombre "merged" sugiere la fusion de adaptadores LoRA sobre el modelo base, practica habitual en flujos de ajuste eficiente con Unsloth.

Su relevancia actual es limitada: acumula 0 descargas y 0 likes, no publica resultados de benchmarks y la documentacion tecnica es minima. El interes principal esta en servir como ejemplo de flujo de trabajo de ajuste fino sobre una base cuantizada a 4 bits con bitsandbytes y posterior fusion a pesos completos, asi como en su caracter multimodal declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; la model card no describe la arquitectura) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de 55,6 GB, compatibles con bf16/fp16); el modelo base se distribuye en 4 bits de bitsandbytes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | unsloth/Qwen3.8-27B-unsloth-bnb-4bit |
| Tamano del repositorio | 55,6 GB |
| Fecha de creacion | 2026-10-05 |
| Ultima actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna: no se detalla si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido. La etiqueta `qwen3_5` y el nombre del modelo base (`Qwen3.8-27B`) apuntan a la familia Qwen 3.5 de Alibaba, pero la ficha no confirma oficialmente esta filiacion ni reproduce la arquitectura concreta. El pipeline `image-text-to-text` implica la presencia de un codificador multimodal, del que tampoco se ofrece informacion.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y la libreria TRL de HuggingFace, con una afirmacion de velocidad "2x faster" respecto a un entrenamiento convencional. No se documentan el volumen de tokens, la composicion del dataset, el idioma de los datos de ajuste, la tecnica de alineacion ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal. El modelo base estaba cuantizado a 4 bits (bitsandbytes), de modo que el ajuste partio de pesos comprimidos; el repositorio publicado contiene pesos en precision completa (55,6 GB para 27,8 B de parametros, coherente con bf16/fp16), lo que sugiere una fusion de adaptadores y una des-cuantizacion previa a la publicacion.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Entrada multimodal imagen-texto declarada por el pipeline `image-text-to-text`, aunque no se especifica que tareas de vision estan soportadas (descripcion, VQA, OCR u otras).
- Compatibilidad con `transformers` y con `text-generation-inference` (TGI), segun las etiquetas del repositorio.
- Compatibilidad declarada con `endpoints_compatible`, lo que indica que puede desplegarse en HuggingFace Inference Endpoints.
- Idiomas: unicamente ingles (`en`) segun los metadatos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo y matematicas: no disponibles.

## Casos de uso

- Generacion de texto en ingles para prototipos y experimentacion: el modelo puede desplegarse con `transformers` o TGI para validar flujos conversacionales basicos antes de escalar a un modelo con documentacion completa.
- Pruebas de pipelines multimodales: al declarar el pipeline `image-text-to-text`, permite experimentar con entrada conjunta de imagen y texto en entornos de investigacion, siempre que se valide primero la calidad real del componente de vision.
- Base para ajuste fino adicional: al partir de pesos Apache 2.0 en safetensors, puede reutilizarse como punto de partida para LoRA o QLoRA con Unsloth sobre dominios especificos.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` facilita el despliegue gestionado para demos internas o APIs de baja concurrencia.
- Evaluacion comparativa de tecnicas de fusion de adaptadores: util para estudiar como afecta la des-cuantizacion desde 4 bits a la calidad final en modelos de ~27 B.
- Generacion de contenido textual en ingles para herramientas internas: redaccion asistida, resumenes o clasificacion, con la advertencia de que no hay benchmarks publicados que respalden la calidad.
- Reproducibilidad academica: permite reproducir el flujo Unsloth + TRL descrito en la model card para estudiar costes y rendimiento del ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (27,8 B) y del tamano del repositorio (55,6 GB). No son datos publicados por el autor.

- VRAM en bf16/fp16: aproximadamente 55,6 GB solo para los pesos, mas cache KV y activaciones; en la practica, del orden de 65-80 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 28-30 GB de pesos.
- VRAM en cuantizacion de 4 bits: aproximadamente 16-18 GB de pesos.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x RTX 6000 Ada 48 GB).
- GPU recomendadas para 8 bits: A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: con cuantizacion de 4 bits el modelo podria encajar en RTX 4090 o RTX 3090 (24 GB) y en equipos Apple Silicon con 32 GB o mas de memoria unificada.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI) y, previsiblemente, vLLM. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simplicio-27B-merged | 27,78 B | no disponible | apache-2.0 | HuggingFace, safetensors |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit (base) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta dataset, tokens de entrenamiento, metodo de alineacion ni evaluaciones, lo que impide auditar el modelo.
- Sesgos conocidos: no disponibles, dado que no se documenta la composicion de los datos de ajuste.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; al no existir evaluaciones publicadas, no puede cuantificarse.
- Solo se declara soporte de ingles; el comportamiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- El modelo base estaba cuantizado a 4 bits: el ajuste sobre pesos comprimidos y la posterior fusion pueden introducir perdidas de calidad respecto a un entrenamiento sobre pesos completos.
- Capacidad multimodal declarada unicamente por la etiqueta del pipeline, sin evidencia publicada de su funcionamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes: no ha sido validado por la comunidad y carece de trazabilidad de uso en produccion.
- No hay pesos GGUF publicados, lo que limita el despliegue en entornos de CPU o de baja VRAM sin conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesleysimplicio/Simplicio-27B-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl (referenciada en la model card, URL no incluida explicitamente en la informacion proporcionada)
