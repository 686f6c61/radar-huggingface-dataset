# TheDrainFlorist/DeepSeek-V4-Flash-VQ-3.2bpw

## Resumen

DeepSeek-V4-Flash-VQ-3.2bpw es una reconstruccion cuantizada del modelo DeepSeek-V4-Flash de DeepSeek, publicada por el usuario TheDrainFlorist. No es un modelo entrenado desde cero, sino una conversion de los pesos oficiales a una geometria de cuantizacion vectorial (vector quantization, VQ) empaquetada para MLX y orientada a Apple Silicon. El objetivo declarado es reducir el peso del release oficial (unos 149 GiB) hasta los 106,4 GiB de pesos de texto, de forma que el modelo quepa en una sola maquina Apple Silicon con 128 GB de memoria unificada.

La arquitectura subyacente es `deepseek_v4`, un transformer de tipo mezcla de expertos (MoE) con expertos enrutados, experto compartido, router e hiper-conexiones, ademas de una cabeza de prediccion multi-token (MTP) que se usa como draft head para decodificacion especulativa. El build usa VQ d4/K2048 (indices de 11 bits) en todas las capas y d4/K4096 (12 bits) en las capas 24-35, mientras que atencion, experto compartido, router, embeddings y cabeza se guardan en affine de 8 bits.

Es relevante ahora porque demuestra que un modelo de gran tamano puede ejecutarse en local en hardware de consumo profesional (Mac Studio / MacBook Pro de 128 GB) con una perdida de fidelidad medida y acotada frente al profesor, y porque su runtime (`deepseek_v4`) todavia no esta integrado ni en `mlx-lm` ni en `transformers`, lo que lo convierte en un caso de estudio de despliegue temprano sobre MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_v4: transformer MoE con expertos enrutados, experto compartido, router, hiper-conexiones y cabeza MTP |
| Parametros totales | 36.049.899.607 (~36,0B) segun el recuento de safetensors; la model card describe el modelo base como ~284B (ver limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Vector quantization d4/K2048 en todas las capas y d4/K4096 en las capas 24-35; affine 8-bit en atencion, experto compartido, router, embeddings y cabeza; cabeza MTP en 6-bit affine (grupo 64) para proyecciones densas y 11-bit para expertos enrutados |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) + model.py + chat_template.jinja |
| Tamano del repositorio | 116,8 GB (106,4 GiB de pesos de texto + 2,38 GiB de la cabeza MTP) |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash |
| Libreria | mlx |

## Arquitectura y entrenamiento

Se trata de una conversion de pesos, no de un entrenamiento nuevo. La model card detalla que los tensores cuantizados son los expertos enrutados: 256 por capa a lo largo de 43 capas, con proyecciones gate/up/down, 129 modulos en total, que suponen aproximadamente 277B de los 284B parametros del modelo base. Cada subvector de 4 pesos almacena un indice de 11 bits en un codebook de 2048 entradas por tensor (d4/K2048); las capas 24-35 usan codebooks de 4096 entradas (codigos de 12 bits). La atencion, el experto compartido, el router, los embeddings y la cabeza se mantienen en affine de 8 bits.

El modelo base no existe en bf16: el release oficial ya usa expertos FP4 y atencion FP8. Para medir la fidelidad, el autor convirtio ese release a layout MLX con los expertos identicos bit a bit (mxfp4) y dequantizo la atencion FP8 exactamente a bf16, y uso ese resultado como profesor. La cabeza MTP replica la capa de prediccion multi-token oficial (`mtp.0`): expertos enrutados en VQ con la geometria del tronco, proyecciones densas (atencion, `e_proj`/`h_proj`, experto compartido) en 6-bit affine, y router, normalizaciones e hiper-conexiones exactas. La decodificacion especulativa con esta cabeza preserva la distribucion de salida pero no es bit-identica a la decodificacion simple.

## Capacidades

- Generacion de texto y uso conversacional (pipeline `text-generation`, tag `conversational`).
- Decodificacion especulativa mediante la cabeza MTP incluida, con una tasa de aceptacion medida de 0,95 en una sola maquina y 0,885 en un split tensorial entre dos Macs.
- Ejecucion local en Apple Silicon, con soporte para split tensorial entre dos maquinas por TCP o RDMA (Thunderbolt 5).
- Modelo solo de texto: no incluye torre de vision.
- Idiomas: unicamente ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, audio, vision): no disponibles.

## Casos de uso

- Inferencia local de texto en una estacion de trabajo Apple Silicon: permite ejecutar un MoE de gran tamano sin depender de la nube, siempre que se disponga de 128 GB de memoria unificada, gracias a los 106,4 GiB de pesos de texto.
- Servicio de chat compatible con OpenAI, Anthropic u Ollama: Knurlogic expone el modelo en `http://127.0.0.1:8080/` con el identificador `local`, lo que facilita integrarlo en clientes existentes sin adaptar el codigo.
- Experimentacion con tecnicas de cuantizacion: la model card publica la metodologia VQ (d4/K2048, K4096 en capas seleccionadas) y los resultados de KL por corpus, lo que lo convierte en material util para investigar cuantizacion vectorial aplicada a MoE.
- Evaluacion de decodificacion especulativa: la cabeza MTP y sus ratios de aceptacion medidos permiten reproducir experimentos de drafting frente a decodificacion simple en una o dos maquinas.
- Despliegue en dos nodos de consumo: el split tensorial reparte unos 54 GiB por Mac, util para equipos que quieran agregar memoria en lugar de comprar hardware especializado.
- Generacion de texto en ingles de uso interno: por su licencia MIT y su caracter local, encaja en flujos de redaccion o resumen donde los datos no deben salir de la maquina.

## Benchmarks y rendimiento

No se han ejecutado benchmarks de tarea sobre este build. La model card lo indica expresamente. La unica metrica publicada es la divergencia KL frente al profesor exacto, medida sobre cache de top-64, con 12288 tokens por corpus, en tres corpus propios (prosa, codigo, literario). Los valores estan en millinats por token; cuanto menor, mas cerca del profesor.

| Build | GiB (texto) | prosa | codigo | literario | media |
|---|---|---|---|---|---|
| Conversion mlx-community con atencion 8-bit (mismos expertos FP4) | ~144 | 6,8 | 3,4 | 1,3 | 3,8 |
| VQ uniforme d4/K256 (no publicado) | 79,9 | 630,6 | 143,1 | 415,6 | 396,4 |
| VQ d4/K256 + K2048 en L24-35 (no publicado) | 86,7 | 438,5 | 129,6 | 164,5 | 244,2 |
| VQ d4/K256 + K2048 en L12-35 (no publicado) | 93,4 | 290,9 | 91,6 | 102,0 | 161,5 |
| VQ uniforme d4/K2048 (no publicado) | 104,1 | 189,1 | 59,7 | 66,2 | 105,0 |
| VQ-3.2bpw (este build) | 106,4 | 151,0 | 48,7 | 45,2 | 81,6 |

Perplejidad del profesor en esos corpus: prosa 2,347; codigo 1,565; literario 1,101 (corpus de dominio publico que el modelo tiene en gran parte memorizado). El autor recomienda clasificar por KL y no por perplejidad, ya que la perplejidad puede absorber errores que se compensan entre si.

En velocidad, la model card no declara tokens por segundo absolutos. Medido como ratio en una misma sesion sobre un M4 Max (128 GB), greedy, 800 tokens y tres ejecuciones por variante, el drafting decodifica aproximadamente 1,42 veces mas rapido que la decodificacion simple.

## Requisitos de hardware

- VRAM/memoria: 106,4 GiB de pesos de texto, con un consumo residente similar; hay que sumar 2,38 GiB cuando se enlaza la cabeza MTP. Requiere una maquina Apple Silicon con 128 GB de memoria unificada.
- Despliegue en dos Macs: el split tensorial de Knurlogic reparte unos 54 GiB por maquina, con comunicacion por TCP o RDMA (Thunderbolt 5).
- GPU compatibles: arquitectura MLX sobre Apple Silicon (por ejemplo, M4 Max con 128 GB). No se mencionan GPU NVIDIA ni AMD.
- Cabeza MTP: opcional, 2,38 GiB adicionales; el autor afirma que cabezas mas grandes no mejoraron la tasa de aceptacion y por eso envia la mas pequena.
- Opciones de despliegue: unicamente Knurlogic. Ni `mlx-lm` estandar ni `transformers` plano cargan esta arquitectura (`deepseek_v4` sigue en pull requests abiertos).
- Latencia y throughput: no se declara cifra absoluta de tokens por segundo. Solo se conoce el ratio de 1,42x con drafting frente a decodificacion simple.

Ejemplo de ejecucion segun la model card:

```bash
pip install knurlogic
hf download TheDrainFlorist/DeepSeek-V4-Flash-VQ-3.2bpw --local-dir ~/Knurlogic/Models/DeepSeek-V4-Flash-VQ-3.2bpw
knurlogic serve ~/Knurlogic/Models/DeepSeek-V4-Flash-VQ-3.2bpw
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-VQ-3.2bpw (este) | ~36B segun safetensors / ~284B segun la model card | no disponible | VQ 3,21 bpw + affine 8-bit + MTP | MIT | HuggingFace, requiere Knurlogic |
| deepseek-ai/DeepSeek-V4-Flash (oficial) | ~284B (base) | no disponible | expertos FP4 + atencion FP8 | no disponible | HuggingFace |
| Conversion mlx-community con atencion 8-bit | no disponible | no disponible | FP4 expertos + atencion 8-bit | no disponible | HuggingFace |

No se dispone de modelos comparables adicionales de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parametros: el dato real de safetensors es de 36.049.899.607 parametros (~36B), mientras que la model card describe el modelo base como ~284B. Conviene verificarlo antes de dimensionar infraestructura.
- Sin benchmarks de tarea: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no puede compararse en rendimiento de tareas con otros modelos.
- Runtime restringido: no carga con `mlx-lm` estandar ni con `transformers` plano. Depende de Knurlogic, cuyo soporte de `deepseek_v4` esta en desarrollo.
- Plataforma unica: esta empaquetado para MLX sobre Apple Silicon; no sirve para GPU NVIDIA u otras plataformas.
- Idioma: solo ingles. No hay evidencia de capacidades multilingues.
- Sin torre de vision: es exclusivamente texto.
- Decodificacion especulativa no determinista: con la cabeza MTP el muestreo preserva la distribucion pero no es bit-identico a la decodificacion simple, lo que puede complicar la reproducibilidad exacta.
- Corpus literario memorizado: el propio autor advierte que la perplejidad del profesor en el corpus literario (1,101) refleja memorizacion, no una mejora real de calidad.
- Validacion de la comunidad nula: 0 descargas y 0 likes en el momento de la consulta.
- Licencia: el build es MIT, pero se deriva de DeepSeek-V4-Flash. Conviene revisar la licencia del modelo base antes de un uso comercial en produccion.
- Riesgo de sesgos y alucinacion: no disponible; no se documentan evaluaciones al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/DeepSeek-V4-Flash-VQ-3.2bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Runtime Knurlogic: https://github.com/noahzelezny/Knurlogic
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
