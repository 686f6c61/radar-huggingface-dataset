# Xylolabs/Qwen3-4B-Tensix-BFP4

## Resumen

Qwen3-4B-Tensix-BFP4 es una cuantizacion del modelo Qwen3-4B de Alibaba Qwen, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de Qwen3-4B (4.411.424.256 parametros, 36 capas) pero aplica GPTQ para redondear las proyecciones lineales de atencion y MLP al formato de coma flotante por bloques `bfloat4_b` (BFP4) de TT-NN, es decir, 4,5 bits por peso. El resultado son 2,82 GB empaquetados con una media de 5,61 bits por peso.

La relevancia de esta ficha es que no se trata de una cuantizacion convencional para GPU: el objetivo es que los pesos ya esten sobre la rejilla BFP4 de TT-NN, de modo que el empaquetado en la NPU no vuelva a redondearlos. Los ficheros se distribuyen en bf16, pero cada valor ya descansa sobre dicha rejilla, lo que permite una conversion exacta a `ttnn.bfloat4_b` y tambien a `ttnn.bfloat8_b`.

Debe tenerse en cuenta que el autor solo ha validado el modelo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent, no sobre hardware real, y que la ruta tt-forge (tt-xla) no se ha ejecutado de extremo a extremo. Es, por tanto, un artefacto pensado para el ecosistema Tenstorrent y para evaluacion en simulacion, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas; cuantizacion GPTQ de proyecciones lineales a BFP4 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en q, k, v, o, gate, up y down de las 36 capas; bf16 en embedding, LM head (atada), normas y demas tensores; media de 5,61 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 con valores sobre la rejilla BFP4; fichero auxiliar `quant4.json` con el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso decoder-only de 36 capas. Sobre el se aplica GPTQ con busqueda de exponente por bloque para redondear las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) al formato BFP4, que emplea un exponente compartido por bloque y mantiene 4 bits de mantisa. La calibracion se realizo con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resto de tensores (embedding, LM head atada al embedding, normas y demas) se conservan en bf16 tal como en el modelo original.

La innovacion tecnica clave es el alineamiento exacto con la rejilla de TT-NN: los pesos se distribuyen en bf16 para maxima compatibilidad con transformers, pero cada valor ya es representable en `bfloat4_b`, de forma que al empaquetarlos en la NPU Tensix no se produce un segundo redondeo. El mismo conjunto de valores tambien se empaqueta de forma exacta en `ttnn.bfloat8_b`. No se documentan en la informacion disponible detalles sobre el entrenamiento original de Qwen3-4B (composicion del dataset, RLHF/DPO) ni sobre tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional mediante plantilla de chat de Qwen3 (`apply_chat_template`).
- Razonamiento y respuesta a preguntas generales, heredados del modelo base Qwen3-4B.
- Capacidades multilingues: no documentadas en esta ficha (la calibracion incluyo coreano, pero no se especifican idiomas soportados).
- Compatibilidad con `transformers` para inferencia en bf16 sobre GPU/CPU.
- Compatibilidad con el stack Tenstorrent: TT-NN (empaquetado exacto en `bfloat4_b` y `bfloat8_b`), tt-transformers (tt-metal v0.81.1) y tt-forge (tt-xla, ejecucion en bf16 exacto).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (modelo solo de texto).
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo esta disenado para empaquetarse en TT-NN sin redondeo adicional, de modo que la inferencia en hardware Tensix aprovecha pesos de 4,5 bits con 2,82 GB empaquetados, reduciendo el uso de DRAM frente al modelo en bf16.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que la conversion a `ttnn.bfloat4_b` (o `bfloat8_b`) reproduce exactamente los valores almacenados, util para integrar en CI de quantizacion.
- Simulacion previa a hardware: al estar probado en ttsim (simulador de Blackhole), sirve para desarrollar y depurar cargas de trabajo de Qwen3 en Tensix antes de disponer de la NPU.
- Chat conversacional ligero en entornos con recursos limitados: con 2,82 GB empaquetados y licencia Apache 2.0, es adecuado para asistentes de texto en dispositivos donde el presupuesto de memoria es ajustado.
- Evaluacion comparativa de precision de cuantizacion: la tabla de evaluacion del autor (KL medio frente a BF16, Top-1 y respuestas correctas) permite medir la perdida de calidad del esquema BFP4 frente al modelo en bf16 en tareas controladas.
- Prototipado con tt-forge / tt-xla: la ruta en bf16 exacto permite ejecutar el modelo con PyTorch y `torch.compile(backend="tt")` para experimentar con el stack de compilacion de Tenstorrent, aunque el autor advierte que no se ha ejecutado de extremo a extremo.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion de la cuantizacion frente al modelo BF16, con columnas de bits por peso, tamano, KL medio frente a BF16, Top-1 y respuestas correctas. Sin embargo, el contenido proporcionado se trunca en la fila de BF16 y no incluye los valores numericos de la comparacion, por lo que no es posible reproducirlos.

| Metrica | Valor |
|---|---|
| Bits por peso (BFP4) | 4,5 en capas lineales; 5,61 de media |
| Tamano empaquetado | 2,82 GB |
| KL medio frente a BF16 | no disponible (dato truncado en la informacion) |
| Top-1 | no disponible (dato truncado en la informacion) |
| Respuestas correctas / perdidas | no disponible (dato truncado en la informacion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en `transformers`: el repo ocupa 8,8 GB en safetensors bf16; se recomienda una GPU con al menos 10-12 GB de VRAM para cargar el modelo completo en bf16 (por ejemplo, RTX 4090 de 24 GB, A100 o H100). Cabe en GPU de consumo de 24 GB.
- Inferencia en Tensix: pensado para NPU Tenstorrent Wormhole y Blackhole; los pesos empaquetados en BFP4 ocupan 2,82 GB, lo que reduce la huella de DRAM en la NPU respecto a bf16.
- Validacion: realizada con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware real.
- Opciones de despliegue: `transformers` (bf16), TT-NN / tt-metal v0.81.1 con tt-transformers (demo `simple_text_demo.py`, requiere `--use_hf_rope`) y tt-forge / tt-xla (ruta en bf16 exacto, no ejecutada de extremo a extremo).
- Latencia y throughput: no disponible; el autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Tensix-BFP4 | 4,41 B | no disponible | BFP4 4,5 bits (lineales), bf16 (resto) | Apache 2.0 | Hugging Face, validado en simulador |
| Qwen/Qwen3-4B (base) | 4,41 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Cuantizaciones GGUF/AWQ de Qwen3-4B | 4,41 B | no disponible | 4-8 bits (enteros/float) | Apache 2.0 (segun autor) | Hugging Face |

La comparativa de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada. La diferencia principal de esta version es su alineamiento exacto con la rejilla BFP4 de TT-NN para NPU Tensix, frente a cuantizaciones orientadas a GPU o CPU.

## Limitaciones y advertencias

- No validado en hardware Tensix real: solo se ha probado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole).
- La ruta tt-forge (tt-xla) ejecuta los pesos en bf16 por defecto; su opcion `bfp_bf4` re-redondea sobre otro diseno de bloque, por lo que para pesos de 4,5 bits debe usarse tt-transformers. El autor indica que tt-forge no se ha ejecutado de extremo a extremo.
- En tt-transformers es obligatorio `--use_hf_rope`; sin el, el QKV fusionado se re-redondea. El demo empaqueta la cabeza atada en bfloat8_b, por lo que no es exacta en ese caso.
- La cuantizacion BFP4 introduce perdida de calidad frente a bf16; los valores concretos de KL, Top-1 y respuestas perdidas no estan disponibles en la informacion proporcionada.
- Calibracion limitada a 65.536 tokens de WikiText-2 y Wikipedia en coreano; puede no representar bien otros dominios o idiomas.
- Idiomas soportados no documentados; no se especifican capacidades multilingues.
- Riesgo de alucinacion y sesgos: no documentados especificamente, heredados del modelo base Qwen3-4B.
- Tool calling, agentes y modo thinking no documentados en esta version cuantizada.
- Licencia Apache 2.0 permite uso comercial, pero se debe cumplir la licencia del modelo base Qwen3-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP4
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Tensix-BFP4/blob/main/LICENSE
- Codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
