# Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts-Head4

## Resumen

`Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts-Head4` es una cuantizacion del modelo `openai/gpt-oss-20b` de OpenAI, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El problema que resuelve es el de empaquetar los pesos del modelo base en formatos de coma flotante por bloques (`bfloat4_b` y `bfloat8_b`) que el runtime TT-NN puede cargar sin transformar los valores, de modo que el modelo ocupe aproximadamente 12,93 GB de memoria de dispositivo en lugar de los ~42 GB del checkpoint original en bf16.

La arquitectura subyacente es la de gpt-oss-20b: un transformer con mezcla de expertos (MoE) de 20.914.757.184 parametros totales. La cuantizacion es selectiva: los expertos enrutados se almacenan en BFP4 (4,5 bits por peso) mediante GPTQ con busqueda de exponente por bloque, las proyecciones de atencion en BFP8 (8,5 bits por peso) por redondeo al mas cercano, y la cabeza LM en BFP4 por redondeo con busqueda de exponente. El resultado promedia 4,95 bits por peso.

Es relevante porque demuestra una via practica para ejecutar un modelo MoE de 20B en aceleradores Tensix con un presupuesto de memoria reducido, y porque documenta con detalle el desajuste de orientacion de bloques entre este checkpoint (bloques a lo largo de las entradas) y el demo oficial de tt-metal (bloques a lo largo de las salidas). El modelo es de noviembre de 2026, cuenta con 26 descargas y 0 likes, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits/peso) en expertos enrutados y cabeza LM; BFP8 (`bfloat8_b`, 8,5 bits/peso) en atencion q/k/v/o; bf16 en router, embeddings y normas; media de 4,95 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores bf16 sobre rejilla BFP4/BFP8), compatible con transformers; empaquetado para TT-NN |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo base, no un reentrenamiento. La arquitectura es la de gpt-oss-20b: un transformer con capas MoE, con 24 capas documentadas en la tabla de formatos. Los tensores se distribuyen en cuatro regimenes de precision: las proyecciones de atencion (q, k, v, o) de las 24 capas se cuantizan a `bfloat8_b` con redondeo al mas cercano; las proyecciones gate, up y down de los expertos enrutados de las 24 capas se cuantizan a `bfloat4_b` con GPTQ y busqueda de exponente por bloque, en bloques de 16 a lo largo de las entradas; el router de las 24 capas permanece en bf16; y la cabeza LM se cuantiza a `bfloat4_b` con redondeo al mas cercano mas busqueda de exponente por bloque, sin GPTQ. Embeddings, normas y el resto de tensores se conservan en bf16.

La innovacion tecnica principal es el uso de coma flotante por bloques en lugar de cuantizacion entera: cada bloque de 16 valores comparte un exponente, lo que permite al runtime TT-NN empaquetar las matrices en `ttnn.bfloat4_b` o `ttnn.bfloat8_b` sin alterar los valores almacenados. El calibrado de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, con una matriz Hessiana independiente por experto; los expertos con pocos tokens de calibrado recurren al redondeo al mas cercano. Los expertos se almacenan con forma `[experts, input, output]`, y el checker incluido verifica que la transposicion preserva los bloques a lo largo de las entradas. El `config.json` elimina la configuracion de cuantizacion MXFP4 original porque los pesos ya estan decodificados a bf16 sobre sus rejillas declaradas.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base gpt-oss-20b, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y codigo: capacidades propias del modelo base, no reentrenadas en este checkpoint.
- Carga directa en `transformers` con `AutoModelForCausalLM` en `dtype="bfloat16"` y `device_map="auto"`.
- Empaquetado nativo en TT-NN para NPU Tensix con `ttnn.as_tensor`, preservando exactamente los valores (verificado con `torch.equal`).
- Verificacion de integridad de la rejilla de cuantizacion mediante los scripts `pack_tensix.py` y `verify_grid.py`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint esta disenado para cargarse en TT-NN con `bfloat4_b` y `bfloat8_b`, ocupando unos 12,93 GB de memoria de dispositivo solo en pesos, lo que permite ejecutar un MoE de 20B en hardware Tensix con presupuesto de memoria acotado.
- Investigacion de cuantizacion BFP: util como referencia reproducible de GPTQ con busqueda de exponente por bloque sobre expertos enrutados, con calibrado documentado (65.536 tokens de WikiText-2 y Wikipedia coreana) y scripts de verificacion incluidos.
- Validacion de pipelines de empaquetado TT-NN: `pack_tensix.py` permite comprobar matriz a matriz que el empaquetado no altera valores, y `--device` anade una ida y vuelta por DRAM del dispositivo, lo que sirve para certificar toolchains de despliegue.
- Prototipado de inferencia en simulador: el checkpoint se verifico con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, lo que permite desarrollar y depurar sin hardware fisico.
- Evaluacion comparativa de formatos: al conservar los mismos valores en bf16 sobre rejilla, el mismo checkpoint se empaqueta exactamente en `ttnn.bfloat8_b`, lo que facilita experimentos de precision frente a memoria en el mismo modelo.
- Generacion de texto en entornos `transformers`: la quickstart con `AutoModelForCausalLM` y `apply_chat_template` permite usar el modelo en pipelines de Python convencionales antes de portarlo a Tensix.
- Analisis de compatibilidad con demos oficiales: documenta y mide el desajuste de orientacion de bloques frente al demo de tt-metal gpt-oss (v0.81.1), util para decidir si reempaquetar o reentrenar la rejilla.

## Benchmarks y rendimiento

La model card incluye una seccion "Evaluation" con una tabla encabezada por "Bits", pero el contenido de resultados no aparece en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 12,93 GB para los pesos del modelo de lenguaje, mas espacio para la cache KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, familias Wormhole y Blackhole.
- El demo oficial de tt-metal gpt-oss (v0.81.1) se ejecuta en cuatro chips Blackhole (QuietBox 2) o en Wormhole LoudBox y Galaxy; no en un solo chip.
- Verificacion realizada con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no se ha ejecutado con este checkpoint en tt-forge (tt-xla).
- Carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"`: requiere memoria de GPU suficiente para el checkpoint decodificado (el repo ocupa 41,9 GB), por lo que no cabe en GPUs de consumo de forma holistica.
- Opciones de despliegue: TT-NN (tt-metal) para Tensix; `transformers` para validacion en GPU/CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts-Head4 | 20.914.757.184 | no disponible | BFP4 expertos + BFP8 atencion (4,95 bits/peso) | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| openai/gpt-oss-20b | 20.914.757.184 | no disponible | MXFP4 en el modelo base | Apache-2.0 | GPU generica |
| Demo tt-metal gpt-oss (v0.81.1) | 20.914.757.184 | no disponible | bfloat4_b con bloques en salidas | Apache-2.0 | 4x Blackhole, Wormhole LoudBox/Galaxy |

La diferencia principal frente al modelo base es el formato de cuantizacion y el empaquetado para TT-NN; frente al demo oficial de tt-metal, la orientacion de los bloques de los expertos (entradas frente a salidas), que provoca una recuantizacion del 7-54 % de los valores de los expertos en la capa 0 segun la medicion del autor.

## Limitaciones y advertencias

- El checkpoint no ha sido reentrenado: hereda los sesgos y el riesgo de alucinacion del modelo base gpt-oss-20b.
- Los expertos se almacenan con bloques a lo largo de las entradas; el demo oficial de tt-metal usa bloques a lo largo de las salidas, por lo que al ejecutarlo con este checkpoint se recuantiza entre el 7 % y el 54 % de los valores de los expertos (medido en la capa 0 con el empaquetador de host de tt-metal).
- El demo de tt-metal no se ha ejecutado en profundidad con este checkpoint, y tt-forge (tt-xla) no se ha probado con el.
- `tt-transformers` no soporta gpt-oss.
- El modelo requiere aproximadamente 12,93 GB de memoria de dispositivo solo para pesos, mas cache KV y buffers; no cabe en un unico chip Tensix segun la configuracion documentada del demo.
- El calibrado de GPTQ usa WikiText-2 y Wikipedia en coreano; los expertos con pocos tokens de calibrado usan redondeo al mas cercano, lo que puede degradar su precision.
- Los idiomas soportados no estan declarados en la informacion disponible.
- El uso comercial esta permitido por la licencia Apache-2.0, pero debe verificarse la licencia del modelo base y el cumplimiento de las condiciones de uso de OpenAI para gpt-oss.
- La fecha de creacion del repositorio (2026-11-13) y el bajo numero de descargas (26) implican poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts-Head4
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Demo gpt-oss de tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gpt_oss
- Paper referenciado: arxiv:2508.10925
- Licencia: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts-Head4/blob/main/LICENSE
