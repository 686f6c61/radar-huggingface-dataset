# xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-4bpw

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ es una cuantizacion de 4 bits por peso (4.0 bpw) del modelo multimodal NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicada por el usuario xv0y5ncu. El modelo base es un transformer de tipo `nemotron_h_omni` (arquitectura hibrida para texto e imagen) con 120.000 millones de parametros nominales, de los cuales 12.000 millones son activos (esquema MoE), desarrollado por NVIDIA. Esta version reduce el peso en disco a aproximadamente 70 GB mediante cuantizacion con codebook trellis-coded (QTIP TCQ), transformada de Hadamard aleatorizada (RHT) y LDLQ.

La relevancia de este checkpoint es practica: permite servir un modelo de 120B con requisitos de memoria notablemente menores que el BF16 original, manteniendo los pesos comprimidos en memoria y decodificandolos al vuelo mediante un kernel CUDA fusionado. La tecnica GLQ rinde mejor en el rango de 2 a 4 bits por peso, y esta version de 4 bpw se situa en ese punto dulce. El SQNR medio de pesos es de 21,24 dB sobre 41.232 capas cuantizadas, calibrado con 128 muestras de 2.048 tokens de WikiText-2.

Importante: el autor advierte que esta build de 4 bpw **no se ha servido aun de extremo a extremo**; las cifras medidas corresponden a la build de 3 bpw. Ademas, GLQ solo cuantiza el modelo de lenguaje: la torre de vision y el proyector permanecen en bf16, y la entrada multimodal (imagen y video) no ha sido validada. El uso probado es exclusivamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tipo `nemotron_h_omni` (texto + vision, MoE) |
| Parametros totales | 34.976.977.416 (segun safetensors del checkpoint cuantizado); el nombre comercial indica 120B |
| Parametros activos | 12B (sufijo A12B del modelo base) |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de servicio (no confirmado el maximo nativo) |
| Tipos de cuantizacion | GLQ 4.0 bpw (trellis-coded QTIP TCQ variante `3inst` + RHT + LDLQ); pesos del LM comprimidos, torre de vision y proyector en bf16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (`other`) |
| Formato de pesos | safetensors (custom code, libreria vLLM) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura `nemotron_h_omni`, una variante hibrida de NVIDIA orientada a entrada image-text-to-text, con mezcla de expertos (120B totales, 12B activos). No se dispone de detalles publicados en la informacion proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO; los datasets referenciados son `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`.

La innovacion destacable de este checkpoint no esta en la arquitectura sino en la cuantizacion: GLQ combina un codebook trellis-coded (QTIP TCQ), una transformada de Hadamard aleatorizada y LDLQ para comprimir los pesos a 4.0 bpw en una unica pasada de decodificacion, sin apilamiento de residuales. Los pesos se mantienen comprimidos en memoria y se decodifican al vuelo con un kernel CUDA fusionado, lo que reduce el footprint sin descomprimir el modelo completo a bf16. La calibracion se realizo con 128 muestras de 2.048 tokens de WikiText-2, alcanzando 21,24 dB de SQNR medio. Es obligatorio usar bf16 (no fp16): en fp16 la build equivalente de Nemotron 3.5 Lightning cierra el bloque `-thinking-` de inmediato sin error ni NaN.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto en la plantilla de chat (bloque `thinking-`).
- Capacidad multimodal declarada en la pipeline (`image-text-to-text`), aunque la entrada de imagen y video **no ha sido validada** en esta build; el autor recomienda desactivarla en el servicio.
- Soporte multilingue en ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento multi-paso (el modelo base esta disenado para cadenas de razonamiento).
- Capacidades de codigo y matematicas heredadas del modelo base (no verificadas en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta build.
- Capacidades de agente: no confirmadas en la informacion disponible.

## Casos de uso

- **Razonamiento de texto de largo contexto**: servir el modelo con `max_model_len=65536` para tareas de analisis documental o sintesis donde se necesita una ventana amplia, aprovechando el modo thinking para cadenas de razonamiento extensas.
- **Generacion de codigo asistida**: el modelo base apunta a tareas de codigo; con esta cuantizacion de 4 bpw se puede integrar en un servidor vLLM interno para autocompletado y explicacion de codigo, siempre que se valide la calidad frente al BF16.
- **Asistente conversacional multilingue**: cubrir conversaciones en ingles, espanol, frances, aleman, italiano y japones con un unico checkpoint, reduciendo el coste de despliegue frente al modelo BF16.
- **Investigacion en cuantizacion**: usar este checkpoint como referencia practica para medir la degradacion de un LM de 120B/12B activos a 4.0 bpw con GLQ, comparando SQNR y calidad de generacion contra el original.
- **Despliegue en hardware con VRAM limitada**: sustituir el BF16 (que no cabe en GPUs de consumo) por esta version de ~70 GB en disco para servidores con menos memoria, aceptando la perdida de precision.
- **Prototipado de pipelines de razonamiento**: experimentar con el modo thinking por defecto en tareas de analisis o planificacion antes de comprometer recursos a la version completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las cifras medidas corresponden a la build de 3 bpw y que esta de 4 bpw no se ha servido de extremo a extremo. El unico dato cuantitativo reportado es el SQNR medio de pesos: 21,24 dB sobre 41.232 capas.

| Metrica | Valor |
|---|---|
| SQNR medio de pesos | 21,24 dB |
| Capas cuantizadas | 41.232 |
| Bits por peso | 4.0 |
| Calibracion | 128 muestras x 2.048 tokens (WikiText-2) |

## Requisitos de hardware

- **VRAM estimada**: el repo pesa 70,0 GB, por lo que se necesita al menos ~70-80 GB de VRAM solo para pesos, mas overhead de KV cache y activaciones; con contexto de 65.536 tokens el requisito crece de forma significativa.
- **GPU recomendadas**: H100 80 GB, A100 80 GB (justo para pesos, limitado para contexto largo) o configuraciones multi-GPU.
- **GPU de consumo**: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; requeriria offloading a RAM/CPU, lo que degrada mucho el throughput.
- **Despliegue**: vLLM con plugin GLQ (requiere `glq >= 0.8.33`, `transformers >= 5.18`, probado con 5.19.0, vLLM 0.32, `dtype="bfloat16"`, `quantization="glq"`). No usar `--trust-remote-code` (el repo no incluye codigo de modelado).
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B-GLQ (esta ficha) | 120B (34,98B en safetensors) | 12B | hasta 65.536 en ejemplo | GLQ 4.0 bpw | OpenMDW 1.1 |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B | 12B | no disponible | BF16 | OpenMDW 1.1 |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ 3 bpw (misma serie) | 120B | 12B | no disponible | GLQ 3.0 bpw | OpenMDW 1.1 |
| SmolLM3-3B GLQ (misma tecnica, otro autor) | 3B | n/a | no disponible | GLQ 4.0 bpw | no disponible |

La comparativa con modelos de otros fabricantes del mismo tamano o categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Build no validada de extremo a extremo**: el autor indica que esta version de 4 bpw no se ha servido aun; las cifras de rendimiento son de la build de 3 bpw.
- **Entrada multimodal sin validar**: la torre de vision y el proyector estan en bf16, pero imagen y video no se han probado; se recomienda servir solo texto (`limit_mm_per_prompt={"image": 0, ...}`).
- **Degradacion por cuantizacion**: 21,24 dB de SQNR implica perdida de fidelidad respecto al BF16; la calidad en tareas exigentes (codigo, matematicas, razonamiento largo) puede degradarse y debe medirse.
- **bf16 obligatorio**: en fp16 el modelo base equivalente falla silenciosamente el razonamiento (cierra el bloque thinking de inmediato). No usar fp16.
- **Compatibilidad fragil**: requiere `glq >= 0.8.33`, `transformers >= 5.18` (probado 5.19.0) y vLLM 0.32; versiones anteriores fallan al iniciar el motor por el campo `vit_hidden_size`.
- **Riesgo de alucinacion**: inherente al modelo base, no mitigado por la cuantizacion.
- **Restricciones de licencia**: OpenMDW 1.1; revisar los terminos de uso comercial y de redistribucion antes de produccion.
- **Idiomas limitados**: seis idiomas soportados; no se garantiza cobertura fuera de esa lista.
- **Hardware**: no cabe en GPUs de consumo; requiere 80 GB o mas.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-4bpw
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Build de 3 bpw con cifras medidas: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-3bpw
- Repositorio GLQ: https://github.com/cnygaard/glq
- Modelo SmolLM3-3B GLQ: https://huggingface.co/xv0y5ncu/SmolLM3-3B-trellis-3inst-4bpw-kernel
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper referenciado: arxiv:2406.11235
