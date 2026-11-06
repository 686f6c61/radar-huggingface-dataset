# Spectrallic/MiniMax-H3-DMAD-4step-int8-convrot

## Resumen

MiniMax-H3-DMAD-4step-int8-convrot es un checkpoint derivado del transformer de generacion de video-audio MiniMax-H3, publicado por el usuario Spectrallic. Se trata de la variante pruned FL2VA (frame-to-video-with-audio) del modelo base de MiniMaxAI, repaquetada por Comfy-Org, a la que se le ha fusionado la destilacion DMAD de 4 pasos del repositorio ZhengmingYu/DMAD y posteriormente se ha cuantizado a INT8 con rotacion Hadamard por grupos (ConvRot). El resultado es un unico fichero safetensors de 21 GB listo para cargar en ComfyUI sin necesidad de un nodo LoRA adicional.

El modelo resuelve un problema practico: el MiniMax-H3 original requiere decenas de pasos de muestreo con classifier-free guidance, lo que encarece enormemente la inferencia. Con la destilacion DMAD horneada, el modelo opera en 4 pasos con CFG 1.0, reduciendo el coste de generacion de forma drastica. La cuantizacion INT8 de las capas lineales de los 50 bloques del transformer reduce ademas el peso en VRAM en comparacion con el checkpoint BF16.

La relevancia actual radica en que combina tres tecnicas de compresion (poda, destilacion few-step y cuantizacion INT8 con rotacion) manteniendo exactamente el layout de tensores del fichero oficial de Comfy-Org, lo que facilita su integracion en pipelines existentes. La licencia es la MiniMax H3 Community License Agreement, con restricciones territoriales explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3 FL2VA pruned), con capas de atencion y MLP en 50 bloques mas 2 bloques token_refiner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo 256) en 200 lineales de bloque; resto en dtypes originales (BF16 para token_refiner) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con restricciones territoriales) |
| Formato de pesos | safetensors (single-file, diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion conjunta de video y audio (pipeline text-to-video / text-to-audio-video). Parte del checkpoint `minimax_h3_fl2va_pruned_bf16` de Comfy-Org, que es una version podada del MiniMax-H3 original de MiniMaxAI. Sobre esa base se fusiona la LoRA `full_critic` de 4 pasos de DMAD, de rango 128, con q/k/v fusionados en adaptadores `attn.qkv_proj` de rango 384. La fusion se aplica a 208 objetivos: `attn.{qkv_proj,out_proj}` y `mlp.{fc1,fc2}` en los 50 bloques y en los 2 bloques `token_refiner`, calculando `W' = W + (alpha/rank) · up @ down` en FP32 con fuerza 1.0.

Tras la fusion, los 200 lineales de bloque se rotan con una Hadamard ConvRot de grupo 256 y se cuantizan a INT8 con escalas por fila (`weight_scale` F32), directamente desde el resultado de la fusion en FP32. Los 8 pesos fusionados de `token_refiner` se devuelven a BF16 porque esa capa permanece sin cuantizar en el fichero de Comfy-Org. El resto de tensores no tocados por la LoRA se copian bit a bit del fichero de referencia. La verificacion byte a byte confirma que los 932 tensores coinciden en nombre, orden, dtype, forma y offset con el fichero INT8 oficial; solo 408 tensores difieren en bytes (los 200 pesos INT8, sus 200 escalas y los 8 pesos de token_refiner). La proyeccion del delta LoRA sobre el cambio respecto a la base da 0.9977 global, con 205 de 208 capas dentro de 1 ± 0.1.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones como 1344×768 y 124 frames a 24 fps en el ejemplo publicado.
- Generacion conjunta de audio y video (text-to-audio-video), con shifts de tiempo independientes para video (12) y audio (2).
- Muestreo few-step: 4 pasos con CFG 1.0, sin classifier-free guidance.
- Compatibilidad de layout con ComfyUI: mismos nombres, orden, dtypes, formas y descriptores `.comfy_quant` que el fichero oficial.
- Soporte de atencion dispersa (SageAttention con sparse attention a densidad 0.15, primer paso denso) segun el ejemplo del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingue explicito; es un modelo generativo de medios, no un LLM.

## Casos de uso

- Generacion de clips cinematograficos cortos: el modelo produce video de 124 frames a 24 fps en 1344×768 con 4 pasos, adecuado para prototipado rapido de escenas conceptuales en estudios de animacion o previsualizacion.
- Previsualizacion de storyboards con audio: al generar video y audio conjuntamente, permite validar ritmo y atmosfera sonora de una secuencia antes de producirla en alta calidad.
- Iteracion creativa en ComfyUI: al mantener el layout exacto del fichero oficial, se puede sustituir el checkpoint INT8 de Comfy-Org por este sin cambiar el grafo, anadiendo la destilacion few-step sin nodo LoRA.
- Generacion de material para redes sociales: clips de pocos segundos con resolucion 1344×768 y coste de inferencia reducido por los 4 pasos y la cuantizacion INT8.
- Investigacion en destilacion de modelos de difusion: sirve como referencia reproducible de como fusionar una LoRA DMAD full-rank y cuantizar a INT8 conservando el layout, con metricas de fidelidad publicadas (0.9977).
- Despliegue en hardware con VRAM limitada: la cuantizacion INT8 de las 200 capas lineales de bloque reduce el peso respecto al BF16, permitiendo ejecutar el modelo en GPUs de gama alta de consumo con los 21 GB del repo como referencia de tamano en disco.
- Pruebas de pipelines de atencion dispersa: el ejemplo usa SageAttention con densidad 0.15, util para evaluar tecnicas de aceleracion sobre un modelo few-step ya destilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 21.0 GB en disco, lo que da una cota inferior orientativa del peso de los pesos, a la que hay que sumar activaciones y buffers de video/audio.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo se renderizo en Nox con SageAttention y atencion dispersa, sin especificar GPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del checkpoint (21 GB) sugiere que requiere GPUs con al menos 24 GB de VRAM para cargar los pesos, pero no hay dato oficial.
- Opciones de despliegue: ComfyUI (con sampler `lcm` y scheduler `simple`, o nodos DMAD Sampler y DMAD Sigmas); el autor indica que el fichero no se ha probado en ComfyUI y que el ejemplo se genero en Nox.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-DMAD-4step-int8-convrot (este) | no disponible | no disponible | 4 (CFG 1.0) | INT8 ConvRot | MiniMax H3 Community License | Hugging Face, single-file |
| Comfy-Org/MiniMax-H3 (INT8 convrot oficial) | no disponible | no disponible | sin destilacion few-step | INT8 ConvRot | MiniMax H3 Community License | Hugging Face |
| Comfy-Org/MiniMax-H3 (bf16 pruned) | no disponible | no disponible | sin destilacion few-step | BF16 | MiniMax H3 Community License | Hugging Face |
| ZhengmingYu/DMAD (LoRA) | no disponible | no disponible | 4 (via LoRA) | requiere cargador LoRA | no disponible | Hugging Face |

## Limitaciones y advertencias

- El autor indica explicitamente que el fichero no se ha probado en ComfyUI; el ejemplo publicado se genero en Nox.
- Los pesos difieren del release oficial de MiniMax-H3 por la fusion de la LoRA DMAD y la cuantizacion; no es un checkpoint identico al original.
- La fidelidad de la LoRA no es perfecta: tres capas de `token_refiner` quedan por debajo del umbral (0.647, 0.896 y 0.899), lo que puede introducir diferencias sutiles frente a la destilacion original.
- La licencia MiniMax H3 Community License Agreement incluye restricciones territoriales; es imprescindible revisar `LICENSE` y `NOTICE` antes de uso comercial.
- Riesgo de alucinacion visual y artefactos propios de modelos de difusion few-step, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de idioma: no disponibles; el modelo es generativo de medios, no de texto.
- El uso de atencion dispersa (densidad 0.15) en el ejemplo puede degradar la calidad si se aplica de forma agresiva; el autor indica primer paso denso.
- No hay datos publicados de latencia, throughput ni requisitos minimos de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-4step-int8-convrot
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base original (MiniMaxAI): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Destilacion DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Paper DMAD: https://arxiv.org/abs/2610.02188
- Codigo DMAD: https://github.com/Yzmblog/DMAD
- Blog sobre atencion dispersa (Nox): https://noxengine.dev/blog/sparse/
- Ejemplo de video: https://huggingface.co/Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot/resolve/main/samples/floating_city_1344x768_seed42.mp4
