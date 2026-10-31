# TitanMamo10/Qwen2.5-1.5B-K2-3.34bpw

## Resumen

Qwen2.5-1.5B-K2-3.34bpw es una cuantización experimental del modelo Qwen2.5-1.5B de Alibaba, publicada por el usuario TitanMamo10 en HuggingFace. El modelo base es un transformer denso de 1.54 B de parámetros, y esta versión aplica un formato de cuantización propio llamado **K2**, basado en cuantización trellis (TCQ, de la familia EXL3/QTIP), a una tasa de 3,34 bits por peso en el cuerpo del modelo. El objetivo es demostrar que se puede lograr una calidad cercana a F16 con un consumo de memoria muy inferior al de los formatos k-quants tradicionales de GGUF.

El autor publica dos variantes del mismo tamaño: una cuantización post-entrenamiento pura (PTQ con block-LDLQ) y otra con **SantanaQAT**, un ajuste cuantización-consciente que entrena solo los tensores de escala (0,09 % de los parámetros) en 605 segundos sobre una GPU de 12 GB. La variante QAT alcanza una perplejidad de 10,2886, inferior incluso a la referencia F16 (10,3099), manteniendo un 79,7 % de retención en las tareas de código medidas.

El modelo es relevante como prueba de concepto del formato K2 y del flujo de trabajo exllamav3 + ik_llama.cpp, más que como modelo de producción. Requiere un runtime específico (la rama K2 de ik_llama.cpp) y presenta un prefill notablemente más lento que las cuantizaciones k-quants equivalentes, aunque ofrece una calidad por bit claramente superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), pesos codificados con cuantización trellis K2 (tile 16×16, rotación block-Hadamard(128)) |
| Parametros totales | 595.798.400 (safetensors) / 1,54 B contando el embedding embebido duplicado según el autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen2.5-1.5B es 32.768 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | K2 trellis a 3,34 bpw (mezcla K=3 61,1 %, K=4 18,8 %, K=5 5,0 %, cabeza K=6 15,1 %; embedding en f16) |
| Idiomas soportados | Inglés (según etiquetas del repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con formato K2 (requiere rama K2 de ik_llama.cpp; no es un ggml_type estándar) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-1.5B, es un transformer decoder-only denso. La innovación de esta ficha no está en la arquitectura del modelo sino en el formato de pesos: **K2** es un códec de cuantización trellis de la misma clase que EXL3/QTIP. Cada matriz se codifica en tiles de 16×16 con una rotación block-Hadamard de 128, decodificación trellis por bitshift y un codebook procedural `mul1`. El payload se almacena como un tensor 3-D `I16` más dos vectores laterales en media precisión por matriz, y requiere un único operador matmul personalizado. El embedding se mantiene en f16, por lo que la tasa efectiva del archivo es de 6,22 bpw sobre los 1,54 B de parámetros totales, aunque el cuerpo del modelo queda a 3,34 bpw.

La cuantización se realizó con el conversor de `exllamav3` más un escritor K2, con un conjunto de calibración de 250×2048 tokens. La variante destacada aplica **SantanaQAT**: un QAT que congela los códigos trellis y entrena únicamente los tensores de escala (394 tensores, 0,09 % de los parámetros) durante 0,77 M de tokens en 605 segundos sobre una GPU de 12 GB. Esta mejora elevó la retención en código de 73,6 % a 79,7 % (significativo según McNemar, p=0,004) y redujo la perplejidad por debajo de la referencia F16.

## Capacidades

- Generación de texto conversacional en inglés (heredada de Qwen2.5-1.5B, etiquetado como conversational).
- Razonamiento matemático básico: retención del 52,0 % en GSM8K respecto a los ítems que F16 resuelve (104 % relativo).
- Completación de código: 79,7 % de retención sobre los ítems que F16 resuelve en un conjunto de 246 ítems.
- Comprensión de lenguaje general: HellaSwag 87,3 % y ARC 87,0 (100 % del rendimiento F16).
- No hay información sobre tool calling, agentes, visión, audio ni modo de pensamiento extendido.
- Capacidades multilingues: limitadas; el repo declara solo inglés.

## Casos de uso

- Investigación en cuantización: es el caso de uso principal; sirve como referencia reproducible (md5 incluidos) para estudiar códecs trellis tipo TCQ y compararlos con k-quants.
- Prueba de calidad por bit en hardware modesto: con 1,2 GB por archivo, permite evaluar cuánta calidad se retiene a ~3,3 bpw frente a IQ3_KS e IQ4_KS en una RTX 3060.
- Inferencia local en portátiles y equipos sin GPU dedicada de gama alta: el archivo cabe holgadamente en 2 GB de VRAM o RAM, útil para despliegues embebidos o edge.
- Chatbots ligeros en inglés para prototipado: dado el tamaño reducido y la velocidad de decodificación (174-176 t/s en RTX 3060), es adecuado para interfaces conversacionales de baja latencia en local.
- Generación de texto por lotes en CPU/GPU de consumo: la decodificación rápida compensa parcialmente el prefill lento en cargas de generación pura con prompts cortos.
- Benchmark de runtimes: comparar el rendimiento de ik_llama.cpp con rama K2 frente a llama.cpp estándar con k-quants en el mismo modelo base.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 3060 (perplejidad sobre 20 chunks; batería de tareas sobre los ítems que F16 resuelve):

| Métrica | K2 3,34 (PTQ) | K2 3,34 + SantanaQAT | F16 | IQ3_KS (3,44 bpw) | IQ4_KS (4,54 bpw) |
|---|---|---|---|---|---|
| Perplejidad | 10,5894 | **10,2886** | 10,3099 | 13,2312 | 10,9485 |
| Coding (246 ítems) | 73,6 % | **79,7 %** | referencia | no disponible | no disponible |
| HellaSwag | no medido | **87,3 %** | no disponible | no disponible | no disponible |
| ARC | no disponible | 87,0 (100 % de F16) | no disponible | no disponible | no disponible |
| Probes | no disponible | 88,8 (106 %) | no disponible | no disponible | no disponible |
| GSM8K | no disponible | 52,0 % (104 %) | no disponible | no disponible | no disponible |
| Decode tg128 (t/s) | 174–176 | no disponible | — | 191,1 | 185,1 |
| Prefill pp512 (t/s) | 3.200–3.250 | no disponible | — | 8.403 | 8.160 |

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo ocupa 1.197.866.720 bytes (~1,2 GB); con contexto y overhead, cabe con holgura en 4 GB de VRAM e incluso en 2 GB.
- GPU usada en las mediciones: RTX 3060 de 12 GB; no se requieren GPUs de datacenter (A100/H100) para este tamaño.
- Consumer GPUs: cualquier GPU moderna con al menos 2-4 GB de VRAM debería ejecutarlo; los kernels CUDA K2 están orientados a tarjetas de consumo.
- Despliegue: exclusivamente mediante **ik_llama.cpp con la rama/PR K2** (operador ggml K2, kernels CUDA GEMV/prefill, loader y grafo). Sin esa rama el archivo no carga. No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama.
- Rendimiento medido (RTX 3060): decodificación de 174–176 t/s (tg128) y prefill de 3.200–3.250 t/s (pp512); el prefill es 2,6× más lento que IQ3_KS/IQ4_KS del mismo modelo.

## Comparativa con modelos similares

Comparativa con cuantizaciones del mismo modelo base medidas por el autor:

| | K2 3,34 bpw (QAT) | IQ3_KS | IQ4_KS |
|---|---|---|---|
| Tasa de bits | 3,34 bpw (cuerpo) | 3,44 bpw | 4,54 bpw |
| Perplejidad | 10,2886 | 13,2312 | 10,9485 |
| Decode tg128 | 174–176 t/s | 191,1 t/s | 185,1 t/s |
| Prefill pp512 | 3.200–3.250 t/s | 8.403 t/s | 8.160 t/s |
| Tamaño de archivo | ~1,2 GB | no disponible | no disponible |
| Runtime | ik_llama.cpp (rama K2) | llama.cpp/ik_llama.cpp estándar | llama.cpp/ik_llama.cpp estándar |

En términos de calidad por bit, K2 a 3,34 bpw supera a IQ3_KS (≈20 % mejor perplejidad) e incluso iguala o mejora a IQ4_KS con un 26 % menos de bits por peso, a costa de un prefill 2,6× más lento y un decode 5–9 % inferior. Como alternativa de ecosistema, EXL3/QTIP ofrecen un enfoque trellis similar con soporte más maduro en exllamav3, aunque no hay datos comparativos publicados en la ficha.

## Limitaciones y advertencias

- **Compatibilidad de runtime**: el archivo no carga en llama.cpp, Ollama, vLLM ni TGI; requiere la rama K2 de ik_llama.cpp, lo que limita severamente su adopción en producción.
- **Prefill lento**: 2,6× por detrás de los k-quants equivalentes; el autor atribuye esto al kernel de tensor cores incluido, no al formato. Mal candidato para prompts largos o RAG.
- **Pérdida de margen en tareas específicas**: código y preguntas de opción múltiple pierden precisión a 3,34 bpw; las variantes de 5,00/6,00 bpw retienen el 97–98 %.
- **Decodificación algo más lenta** (5–9 %) que IQ3_KS/IQ4_KS pese a leer menos bytes.
- **Idioma**: etiquetado solo para inglés; el comportamiento en castellano u otras lenguas no está documentado ni verificado en la ficha.
- **Riesgo de alucinación**: inherente a un modelo de 1,5 B; no se documentan mitigaciones específicas.
- **Contexto y capacidades**: la longitud de contexto efectiva y el soporte de tool calling no están verificados para esta cuantización.
- **Licencia**: Apache-2.0, sin restricciones para uso comercial, aunque la calidad del modelo base de 1,5 B puede ser insuficiente para muchos casos comerciales.
- **Estado experimental**: el paper de referencia tiene DOI pendiente en Zenodo; los resultados provienen de mediciones del propio autor y no de una evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TitanMamo10/Qwen2.5-1.5B-K2-3.34bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Runtime requerido (base del PR K2): https://github.com/ikawrakow/ik_llama.cpp
- Paper con encoder, estudio y log de mediciones: pendiente de publicación en Zenodo (DOI no disponible)
