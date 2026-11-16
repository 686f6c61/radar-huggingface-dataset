# tknez/GaMS3-12B-Instruct-Lex-NVFP4

## Resumen

GaMS3-12B-Instruct-Lex-NVFP4 es una versión cuantizada del modelo cjvt/GaMS3-12B-Instruct-Lex, un modelo de lenguaje de tipo Gemma 3 (arquitectura `Gemma3ForCausalLM`) con 12.772.912.896 parámetros totales. El autor de la cuantización es el usuario de Hugging Face tknez, mientras que el modelo original procede del proyecto GaMS3 del instituto esloveno CJVT. El modelo está especializado en esloveno e inglés y orientado a generación de texto conversacional.

La aportación principal de esta ficha es la cuantización a formato NVFP4 (pesos de 4 bits con formato E2M1, block_size de 16 y escalado por bloque en FP8 E4M3), realizada con NVIDIA ModelOpt. Esto reduce el tamaño del modelo de aproximadamente 25,5 GB en BF16 a unos 9,39 GB, lo que supone una compresión de unas 3,5 veces. El resultado es un modelo pensado para inferencia de baja latencia y alta eficiencia en GPUs con arquitectura NVIDIA Blackwell (B200 y posteriores).

Es relevante ahora porque permite desplegar un modelo de 12B en hardware de gama alta con requisitos de memoria muy reducidos, manteniendo compatibilidad con vLLM y TensorRT-LLM. No obstante, la cuantización FP4 limita su ejecución a GPUs Blackwell, por lo que no es utilizable en generaciones anteriores como Ampere o Hopper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForCausalLM (transformer decoder-only) |
| Parametros totales | 12.772.912.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 16384`) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1, block_size=16, escalado por bloque FP8 E4M3) |
| Idiomas soportados | esloveno (sl), ingles (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (cuantizados NVFP4) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Gemma 3, identificado en la model card con la clase `Gemma3ForCausalLM`. Sobre esa base, el autor aplica una cuantización post-entrenamiento con NVIDIA ModelOpt al formato NVFP4: pesos de 4 bits en formato FP4 E2M1 agrupados en bloques de 16 elementos, con un factor de escala por bloque en FP8 E4M3. Esta combinación de pesos y activaciones de 4 bits (W4A4) es la que permite la compresión de ~25,5 GB a ~9,39 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones arquitectónicas adicionales más allá de las propias de Gemma 3. La model card solo documenta el proceso de cuantización y el despliegue con vLLM, sin entrar en detalles del entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en esloveno e inglés.
- Instrucciones y diálogo multi-turno (el nombre "Instruct" del modelo base sugiere ajuste por instrucciones, aunque no se detalla el método).
- Razonamiento y generación de texto general, heredado del modelo Gemma 3 base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a los idiomas declarados (sl, en).
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Inferencia eficiente en GPUs Blackwell gracias al formato NVFP4.

## Casos de uso

- Asistencia conversacional en esloveno: el modelo está especializado en esloveno e inglés, por lo que es adecuado para chatbots y asistentes dirigidos al mercado esloveno, donde la oferta de modelos abiertos es escasa.
- Despliegue de bajo coste en GPUs Blackwell: gracias a su tamaño de ~9,39 GB en NVFP4, se puede servir con vLLM en una sola GPU Blackwell con requisitos de memoria muy inferiores a los del modelo en BF16.
- Generación de contenido en esloveno: redacción de textos, resúmenes y respuestas para aplicaciones editoriales o administrativas en esloveno.
- Traducción asistida esloveno-inglés: al cubrir ambos idiomas, puede emplearse en pipelines de traducción o posedición dentro de flujos de trabajo bilingües.
- Prototipado rápido de aplicaciones LLM: el formato NVFP4 y la compatibilidad con vLLM y TensorRT-LLM facilitan el despliegue en entornos de experimentación con GPUs Blackwell.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de NVFP4 en la calidad de un modelo de 12B, comparándolo con su versión BF16.
- Inferencia de baja latencia: el formato FP4 reduce el ancho de banda de memoria, lo que resulta útil en servicios que requieren tiempos de respuesta ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,39 GB solo para los pesos en NVFP4; hay que añadir la memoria para el contexto KV y los buffers de ejecución.
- GPU recomendadas: NVIDIA Blackwell (B200 y posteriores), única arquitectura compatible con NVFP4 según la model card.
- No cabe en GPUs consumer de generaciones anteriores (Ampere, Hopper) ni en GPUs sin soporte FP4; la model card no menciona compatibilidad con RTX 50xx.
- Opciones de despliegue: vLLM (`vllm serve tknez/GaMS3-12B-Instruct-Lex-NVFP4 --dtype bfloat16 --max-model-len 16384`) y TensorRT-LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| GaMS3-12B-Instruct-Lex-NVFP4 | 12,77B | no disponible (ejemplo a 16K) | NVFP4 | gemma | GPU Blackwell |
| cjvt/GaMS3-12B-Instruct-Lex (base) | 12,77B | no disponible | BF16 | gemma | GPU genericas |
| Gemma 3 12B (referencia de familia) | ~12B | no disponible | BF16, int8, etc. | gemma | GPU genericas |

La comparativa se limita al modelo base y a la familia Gemma 3, ya que no se dispone de datos de rendimiento ni de otros modelos cuantizados en NVFP4 con los que contrastar. El principal diferencial frente al modelo base es el tamaño (~9,39 GB frente a ~25,5 GB) y la necesidad de hardware Blackwell.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al heredar el comportamiento de Gemma 3, es previsible que arrastre sesgos del modelo base.
- Riesgo de alucinación: no cuantificado; la cuantización a 4 bits puede degradar la fidelidad respecto al modelo en BF16.
- Limitaciones de idioma: solo se declaran esloveno e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: la licencia "gemma" (Gemma Terms of Use) impone condiciones de uso comercial y de redistribución que deben revisarse antes de un despliegue en producción.
- Compatibilidad de hardware: NVFP4 requiere GPUs Blackwell; no es ejecutable en Ampere, Hopper ni en GPUs consumer sin soporte FP4.
- Longitud de contexto: no documentada; el ejemplo de servicio con `--max-model-len 16384` sugiere un límite práctico de 16K, pero no se confirma el máximo del modelo.
- Escasa adopción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- No hay información sobre tool calling ni capacidades de agente, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tknez/GaMS3-12B-Instruct-Lex-NVFP4
- Modelo base: https://huggingface.co/cjvt/GaMS3-12B-Instruct-Lex
- NVIDIA ModelOpt: no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- TensorRT-LLM: no disponible en la información proporcionada
