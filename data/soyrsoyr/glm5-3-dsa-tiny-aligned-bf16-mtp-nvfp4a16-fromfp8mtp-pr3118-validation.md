# soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-FromFP8MTP-pr3118-validation

## Resumen

Este repositorio contiene un artefacto de validacion estructural, no un modelo de lenguaje entrenado. Se trata de un fixture de pesos aleatorios de 88.040.064 parametros (unos 88 M) publicado por el usuario soyrsoyr para verificar el pipeline de cuantizacion de llm-compressor (PR 3118) y la ruta de decodificacion especulativa MTP en vLLM. Deriva de soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture, del que conserva el backbone en BF16 mientras convierte el modulo MTP a FP8 por bloques y, despues, a NVFP4A16.

Su relevancia es puramente de ingenieria: documenta que un checkpoint con backbone BF16 y MTP en FP8 nativo puede descomprimirse y recuantizarse al formato FP4 solicitado conservando las dimensiones alineadas, y que el resultado carga y genera en una H100 con metricas reales de draft tokens. El propio autor advierte de que la validacion superada es de carga y generacion, no de calidad ni de rendimiento, y de que no se aplica ninguna afirmacion de calidad.

Al no contener pesos preentrenados, el modelo carece de capacidades linguisticas utiles y no tiene benchmarks publicados. Su valor esta en servir como referencia reproducible para equipos que trabajan con formatos comprimidos, decodificacion especulativa MTP y compatibilidad de runtimes de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como glm_moe_dsa (familia GLM MoE); detalles de capas no publicados en la informacion disponible |
| Parametros totales | 88.040.064 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la validacion se ejecuta con `--max-model-len 1024`) |
| Tipos de cuantizacion | NVFP4A16 (FP4 solo en pesos, activaciones de 16 bits), MXFP4 (cuantizacion dinamica de activaciones), FP8 por bloques (MTP nativo de origen), BF16 (backbone) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; el modelo derivado no anade concesion de licencia y sigue aplicandose la licencia del modelo de origen) |
| Formato de pesos | safetensors con compressed-tensors |
| Tamano del repositorio | 0,2 GB |
| Modelo base | soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint no ha sido entrenado. El autor lo describe explicitamente como un fixture estructural de pesos aleatorios, no como pesos preentrenados de GLM-5.3; por tanto no existe dataset de entrenamiento, numero de tokens, composicion de datos ni fases de RLHF, DPO o ajuste por instrucciones que reportar. Lo que si esta documentado es la cadena de derivacion: se parte de un checkpoint de prueba cuyo backbone se mantiene en BF16 y cuyo modulo MTP se convierte a FP8 por bloques nativo (sin ser una release FP8 oficial), y despues el MTP en FP8 se descomprime y se recuantiza al formato FP4 solicitado. Los formatos del backbone y del MTP son independientes entre si y deben inspeccionarse por separado en `config.json`, en `recipe.yaml` cuando este presente y en `pr3118-validation.json`.

La innovacion tecnica que se valida es doble. Por un lado, la ruta de cuantizacion de llm-compressor (PR 3118, commit 87347881) para producir NVFP4A16, que es FP4 solo en pesos con activaciones de 16 bits y no un NVFP4 W4A4 calibrado; el autor distingue ademas el caso MXFP4, que si emplea cuantizacion dinamica de activaciones. Por otro, la verificacion de extremo a extremo de la decodificacion especulativa MTP, que exige metricas positivas de draft tokens y no se conforma con que el modelo simplemente cargue. La linea base de runtime validada es vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0, con la advertencia de que MXFP4 requiere ejecutar en B200 para establecer compatibilidad de runtime.

## Capacidades

- Generacion de texto: tecnicamente posible porque la arquitectura y el tokenizador se cargan, pero la salida procede de pesos aleatorios y carece de valor semantico.
- Decodificacion especulativa MTP: ruta validada en H100 con metricas reales de draft tokens (`num_speculative_tokens=1`), que es el objeto principal del fixture.
- Conversacional: el repositorio incluye la etiqueta `conversational`, aunque no hay evidencia de comportamiento conversacional util al no existir entrenamiento.
- Carga en vLLM con cuantizacion comprimida: formato compressed-tensors compatible con el pipeline de llm-compressor.
- Razonamiento, codigo, matematicas, vision y audio: no disponibles; el modelo no ha sido entrenado para ninguna de estas tareas y la configuracion de servicio limita explicitamente imagen y video a cero.
- Tool calling y function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Validacion de pipelines de cuantizacion: el fixture permite comprobar que una receta de llm-compressor (PR 3118) descomprime un MTP en FP8 y lo recuantiza a NVFP4A16 sin romper las dimensiones alineadas, comparando el resultado contra `pr3118-validation.json`.
- Verificacion de decodificacion especulativa MTP: con `python verify_mtp.py /path/to/snapshot` se ejecutan dos prompts y se exige metrica positiva de draft tokens, de modo que un arranque correcto del servidor no se contabiliza como exito.
- Pruebas de integracion continua en proyectos de inferencia: al pesar 0,2 GB, el repositorio puede actuar como fixture ligero en CI para detectar regresiones de carga de safetensors comprimidos en cada version de Transformers o vLLM.
- Validacion de compatibilidad de runtimes: sirve para comprobar que una combinacion concreta de vLLM, Transformers y CUDA (por ejemplo, la linea base documentada 0.29.1rc1 con CUDA 13.0) acepta checkpoints NVFP4A16 con MTP.
- Pruebas de configuracion de servido: el comando documentado con `--dtype bfloat16`, `--max-model-len 1024`, `--enforce-eager`, `--gpu-memory-utilization 0.85`, `--speculative-config` y `--limit-mm-per-prompt` permite ensayar parametros de despliegue antes de aplicarlos a modelos reales.
- Comparacion entre formatos de activacion: al convivir NVFP4A16 y MXFP4 en el mismo entorno de validacion, se pueden contrastar rutas de cuantizacion de pesos y de activaciones dinamicas.
- Docencia y demostraciones de flujo de cuantizacion: sirve para ilustrar, sin coste de descarga elevado, como se estructura un checkpoint comprimido y que ficheros de metadata acompanan a los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que "H100 load and generation PASSED with actual MTP draft-token metrics" no constituye un benchmark de calidad ni de rendimiento, y que no se aplica ninguna afirmacion de calidad al tratarse de un fixture de pesos aleatorios.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 0,2 GB para los pesos en BF16 (88 M de parametros a 2 bytes), aproximadamente la mitad en FP8 y menos de 0,1 GB en FP4, mas el overhead de KV cache y del runtime de vLLM. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: la validacion documentada se realizo en NVIDIA H100. Para MXFP4 el autor indica que se requiere una ejecucion en B200 para establecer compatibilidad de runtime.
- GPU de consumo: por tamano, el checkpoint cabe sin dificultad en cualquier GPU de consumo con 8 GB o mas, e incluso en CPU; no se documenta una validacion especifica en ese hardware.
- Opciones de despliegue: vLLM es la ruta validada, con la linea base vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican medidas de latencia ni de tokens por segundo. La unica metrica reportada es la existencia de draft tokens positivos en la decodificacion especulativa MTP con un token especulativo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada: se trata de un fixture de validacion con pesos aleatorios y no de un modelo de lenguaje publicable. La unica comparacion posible es dentro de su propia cadena de derivacion.

| Artefacto | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-FromFP8MTP-pr3118-validation | Fixture estructural, pesos aleatorios, MTP en NVFP4A16 | 88.040.064 | no disponible | other | Publico en HuggingFace |
| soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture (origen) | Checkpoint de prueba derivado, backbone BF16 y MTP en FP8 por bloques nativo | no disponible | no disponible | se aplica la del upstream | Publico en HuggingFace |
| GLM-5.3 oficial | Modelo real | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios y el autor lo declara como fixture estructural, no como pesos preentrenados de GLM-5.3. Cualquier salida de texto carece de valor.
- No admite afirmaciones de calidad: el autor senala que no se aplica ninguna afirmacion de calidad y que la validacion superada es unicamente de carga y generacion.
- Riesgo de confusion en produccion: desplegarlo como si fuera un modelo real produciria respuestas sin sentido; debe etiquetarse como artefacto de prueba.
- Licencia: es "other" y el propio repositorio indica que la validacion no anade ninguna concesion de licencia, por lo que sigue aplicandose la licencia del modelo de origen. Es imprescindible consultar la model card upstream antes de cualquier uso.
- Formatos mixtos: el backbone y el MTP tienen formatos independientes; asumir un unico formato puede provocar fallos de carga. Hay que revisar `config.json`, `recipe.yaml` y `pr3118-validation.json`.
- NVFP4A16 no es NVFP4 W4A4: se trata de FP4 solo en pesos con activaciones de 16 bits, y no de una cuantizacion calibrada de 4 bits en pesos y activaciones.
- Compatibilidad de runtime fragil: la validacion depende de versiones concretas de vLLM, Transformers y CUDA; MXFP4 requiere ademas pruebas en B200.
- Idiomas, sesgos y alucinacion: no disponibles como datos; al no haber entrenamiento no existen sesgos medidos ni estudios de alucinacion, pero tampoco ninguna garantia de comportamiento.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que refuerza que se trata de un artefacto de validacion puntual y no de un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-DSA-Tiny-Aligned-BF16-MTP-NVFP4A16-FromFP8MTP-pr3118-validation
- Modelo base (revision fijada): https://huggingface.co/soyrsoyr/GLM-5.3-MTP-NVFP4-Test-Fixture/tree/0b017a9420e734a8443d46a9ec1a5128e4255ae7
- Commit de llm-compressor PR 3118: https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Ficheros de validacion incluidos en el repositorio: `pr3118-validation.json` y `verify_mtp.py`
