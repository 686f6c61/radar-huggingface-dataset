# yashmoar/Qwen2.5-3B-SFT-random-15k

## Resumen

`yashmoar/Qwen2.5-3B-SFT-random-15k` es un ajuste fino completo de `Qwen/Qwen2.5-3B-Instruct`, publicado por el usuario yashmoar. No introduce una arquitectura nueva: parte de un transformer decoder-only de la familia Qwen2.5 con 3.085.938.688 parámetros y lo entrena con 15.000 filas seleccionadas de forma uniforme y aleatoria del dataset `acereason-15k-random`, compuesto por problemas de matemáticas y código.

El modelo se plantea como un baseline reproducible de SFT aleatorio: sirve para comparar el efecto de seleccionar datos sin curación frente a subconjuntos filtrados o curados de AceReason. La model card indica un entrenamiento de 3 épocas, learning rate 5e-6, scheduler cosine y un límite de 16.384 tokens por secuencia; la evaluación se realizó con hasta 32.768 tokens.

Su relevancia es metodológica más que de rendimiento: en la evaluación agregada de 8 benchmarks de matemáticas y ciencia obtiene pass@1 0.272 y pass@8 0.548, frente a 0.285 y 0.535 del modelo base. Es decir, mejora ligeramente pass@8 pero empeora pass@1, por lo que debe interpretarse como un punto de control experimental, no como un modelo necesariamente superior al base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5, heredada de `Qwen/Qwen2.5-3B-Instruct` |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en evaluación; el fine-tuning se realizó con un límite de 16.384 tokens |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors y no se publican GGUF, AWQ, GPTQ ni otras cuantizaciones oficiales |
| Idiomas soportados | No disponibles |
| Licencia | `qwen-research` (`license: other`, `license_name: qwen-research`) |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen2.5-3B-Instruct` |
| Dataset de entrenamiento | `yashmoar/acereason-15k-random` |
| Tamaño del repositorio | 6,8 GB |
| Descargas / likes | 0 / 0 |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo, no un adaptador, de `Qwen2.5-3B-Instruct`. Conserva la arquitectura transformer decoder-only del base, con 3.085.938.688 parámetros. El entrenamiento se realizó durante 3 épocas, con learning rate 5e-6, scheduler cosine, 8 secuencias por paso y un límite de 16.384 tokens. No se documenta el uso de RLHF, DPO, decodificación especulativa ni otras innovaciones técnicas adicionales.

El dataset `yashmoar/acereason-15k-random` contiene 15.000 filas elegidas uniformemente al azar, con semilla 42, de las 100.000 filas de `acereason11_100k`, que mezcla matemáticas y código. La model card indica que no se eliminó nada: es un baseline aleatorio sin curación ni filtrado. La evaluación se hizo con 8 respuestas por pregunta, temperatura 0.6, top-p 0.95 y hasta 32.768 tokens, promediando 8 benchmarks de matemáticas y ciencia.

## Capacidades

- Generación de texto y seguimiento de instrucciones: capacidades heredadas de `Qwen2.5-3B-Instruct
