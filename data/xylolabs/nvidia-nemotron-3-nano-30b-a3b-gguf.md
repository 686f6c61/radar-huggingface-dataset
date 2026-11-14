# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B es un modelo de lenguaje de tipo mixto de expertos (MoE) e hibrido Mamba-Transformer desarrollado por NVIDIA, orientado a razonamiento agentico y generacion de texto. Esta ficha concreta corresponde a la conversion a GGUF y cuantizacion Q4_K_M realizada por Xylolabs a partir de los pesos BF16 originales, pensada para ejecucion local con llama.cpp. El modelo cuenta con 31.577.940.288 parametros totales y activa aproximadamente 3.000 millones por token (de ahi el sufijo A3B), lo que permite un equilibrio entre calidad y coste computacional.

La relevancia de esta publicacion radica en que hace accesible en hardware de consumo un modelo de 30B con arquitectura hibrida: de sus 52 capas principales, 23 son Mamba-2, 23 son MoE y solo 6 son de atencion clasica. Esa combinacion reduce el coste del estado recurrente y del KV cache frente a un transformer denso equivalente. El archivo GGUF ocupa 24,515 GB y conserva los 128 expertos enrutados mas el experto compartido de cada capa MoE.

La conversion no introduce nuevo entrenamiento, calibracion ni cuantizacion adicional: preserva los valores cuantizados existentes y los metadatos de tokenizer y plantilla de chat del modelo base. Esta pensada para quienes necesitan desplegar el modelo en local sin depender de infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + MoE + atencion (52 capas: 23 Mamba-2, 23 MoE, 6 de atencion) |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | Aproximadamente 3B por token (denominacion A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada (los metadatos originales se conservan; los ejemplos usan 2.048 y 8.192 tokens) |
| Tipos de cuantizacion | Q4_K_M mixta (tipos reales de tensor: F32 237, Q4_K 29, Q5_0 110, Q8_0 25; media 6,209 bits/peso) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (un unico archivo `NVIDIA-Nemotron-3-Nano-30B-A3B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con 52 capas principales distribuidas en 23 capas Mamba-2, 23 capas MoE y 6 capas de atencion. Cada capa MoE conserva 128 expertos enrutados mas un experto compartido. Esta mezcla busca combinar la eficiencia de estado recurrente de Mamba-2 con la capacidad de recuperacion de informacion de la atencion clasica, manteniendo un coste de activacion bajo gracias al enrutamiento disperso.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original. La model card de esta conversion indica explicitamente que no se realizo entrenamiento, calibracion ni cuantizacion nuevos para su publicacion: se trata de una preservacion de los valores cuantizados y de los metadatos del modelo base. Los tensores de mayor precision se conservan en F32 (normas de atencion, `ssm_a`, `ssm_conv1d`, `ssm_d`, `ssm_dt`, `ssm_norm`, `exp_probs_b`, `ffn_gate_inp`, `output_norm`) y en Q8_0 (`attn_v`, `ffn_down_exps`, `ffn_down_shexp`, `output`), lo que eleva la media por encima de cuatro bits.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento agentico y multi-step, segun la orientacion declarada del modelo base (titulo del informe tecnico: "Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning").
- Modo de pensamiento (thinking) configurable mediante `enable_thinking` en los kwargs de la plantilla de chat.
- Plantilla de chat compatible con llama.cpp mediante `--jinja`.
- Soporte de conversaciones de un solo turno y multi-turno a traves de la CLI de llama.cpp.
- No se documentan en la informacion disponible capacidades de vision, audio ni tool calling nativo; deben verificarse contra la model card del modelo base.

## Casos de uso

- Inferencia local en estaciones de trabajo: con 24,515 GB de pesos en Q4_K_M, el modelo puede ejecutarse en una GPU de 32 GB o repartirse entre GPU y CPU, lo que permite prototipar agentes sin depender de la nube.
- Razonamiento agentico en local: el modo thinking y el diseno MoE con ~3B parametros activos lo hacen adecuado para cadenas de razonamiento de varios pasos donde la latencia por token importa mas que el coste total de memoria.
- Asistentes conversacionales en ingles y coreano: la plantilla de chat preservada y el soporte explicito de ambos idiomas permiten desplegar dialogos multi-turno con `llama-cli` o servidores compatibles con llama.cpp.
- Evaluacion y benchmarking de cuantizaciones: al conservar los valores cuantizados y los metadatos originales, sirve como referencia reproducible para comparar Q4_K_M frente a BF16 con la misma configuracion de prompts y presupuestos de generacion.
- Pipelines de CI/CD para validacion de modelos: el comando de ejemplo con `--temp 0`, contexto de 2.048 tokens y una unica consulta es un smoke test determinista util para comprobar que una build de llama.cpp carga correctamente el modelo.
- Investigacion sobre arquitecturas hibridas: las 23 capas Mamba-2 y las 6 de atencion permiten estudiar el comportamiento de modelos hibridos en tareas de texto sin necesidad de infraestructura multinodo.
- Despliegue en entornos con memoria limitada: al ser un unico archivo GGUF, encaja en flujos de trabajo con llama.cpp u otros runners compatibles, con margen adicional para KV cache, estado recurrente y buffers.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Respuestas correctas (referencia preservada) | 31/33 + 7/7, sin perdidas contadas ni respuestas rotas |
| Respuestas correctas (BF16 original almacenado) | 31/33 + 7/7 |
| KL media frente a BF16 | 0,082937 |
| Posiciones evaluadas | 8.188 sobre cuatro secuencias emparejadas de 2.048 tokens en ingles y coreano |
| Contexto de evaluacion actual | 8.192 tokens |
| Velocidad | No reportada en la informacion disponible |

Las perdidas contadas excluyen empates cercanos en BF16 (diferencia entre los dos primeros candidatos inferior a 1,0 en el primer token divergente) y elementos de razonamiento recuperados con thinking activado. Las respuestas rotas se cuentan solo cuando BF16 acierta. La correccion bruta se reporta por separado de estas exclusiones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 24,515 GB solo para los pesos GGUF, mas espacio para KV cache, estado recurrente y buffers de trabajo.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, encaja en GPU de 32 GB o en configuraciones multi-GPU con reparto de capas.
- GPU de consumo: no cabe integramente en GPU de 24 GB; es viable con offload parcial a CPU en tarjetas de 16-24 GB, a costa de latencia.
- Opciones de despliegue: llama.cpp (verificado con la build v0.9.0 y el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`); otros runners compatibles con GGUF no se detallan en la informacion proporcionada.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B (esta conversion) | 31,58B totales, ~3B activos | No disponible | NVIDIA Nemotron Open Model License | GGUF Q4_K_M | Hibrido Mamba-2/MoE/atencion, 128 expertos |
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | 31,58B totales, ~3B activos | No disponible | NVIDIA Nemotron Open Model License | Safetensors BF16 | Referencia de calidad; requiere mas memoria |
| Otras alternativas de ~30B con MoE | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone en la informacion proporcionada de resultados de benchmarks de terceros que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la informacion disponible.
- La cuantizacion Q4_K_M introduce una divergencia medible frente a BF16 (KL media de 0,082937 sobre 8.188 posiciones); en tareas sensibles a la precision conviene validar contra el modelo BF16.
- La licencia NVIDIA Nemotron Open Model License es de tipo "other" y no equivale a una licencia permisiva estandar; es imprescindible revisar los terminos completos en `LICENSE` antes de un uso comercial.
- El archivo se distribuye "tal cual", sin garantia ni respaldo de NVIDIA; la conversion y cuantizacion son responsabilidad de Xylolabs.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion concreta.
- La model card advierte que las comprobaciones cubren textos almacenados y prompts cortos; una integracion real necesita su propia evaluacion por tarea.
- No se documentan capacidades multimodales ni de tool calling nativo en la informacion disponible.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Informe tecnico (arXiv): https://arxiv.org/abs/2512.20848
- Codigo de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentacion de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF/blob/main/LICENSE
