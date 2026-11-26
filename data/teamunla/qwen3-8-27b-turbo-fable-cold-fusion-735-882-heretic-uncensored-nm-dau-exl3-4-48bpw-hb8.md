# TeamUNLa/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-exl3-4.48bpw-hb8

## Resumen

Esta ficha describe una conversión comunitaria al formato ExLlamaV3 (EXL3) del modelo denso `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, publicada por el colectivo TeamUNLa. No se trata de un modelo entrenado desde cero, sino de una cuantización de 4,48 bits por peso (bpw) pensada para ejecutar un LLM de gran tamaño en hardware de consumo. El objetivo declarado es ofrecer una variante que quepa íntegramente en VRAM de 20 GB manteniendo la calidad de razonamiento y programación del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una práctica habitual en la comunidad open source (reempaquetar pesos en formatos eficientes para inferencia local); por otro, evidencia una discrepancia importante entre los datos declarados en la model card y los metadatos reales del repositorio. La model card habla de un modelo denso de 27B parámetros, mientras que el recuento real de safetensors arroja 9.147.520.384 parámetros (unos 9,15B). Conviene tratar cualquier afirmación de tamaño con cautela.

Arquitectura, contexto y datos de entrenamiento del modelo base no están detallados en la información disponible. Los tags apuntan a la familia Qwen (qwen3_5, qwen3_6, qwen3_8), a un pipeline image-text-to-text y a un ajuste fino orientado a eliminar restricciones de alineación ("heretic", "uncensored"). Todo ello debe considerarse indicativo, no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tags apuntan a familia Qwen; pipeline image-text-to-text) |
| Parametros totales | 9.147.520.384 según safetensors; la model card declara 27B (dato no verificado) |
| Parametros activos | No aplica (modelo denso según la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 a 4,48 bpw (receta hb8-mb4: lm_head y linear_attn.out_proj a 8 bpw, mlp.down_proj a 5 bpw, resto a 4 bpw) |
| Idiomas soportados | Inglés y español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato ExLlamaV3 (EXL3); tamaño del repo 18,3 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. Los tags del repositorio (`qwen3_5`, `qwen3_6`, `qwen3_8`) sugieren que deriva de la familia Qwen, y el pipeline declarado (`image-text-to-text`) apunta a capacidades multimodales, pero no hay confirmación de si se trata de un transformer denso, híbrido o con atención lineal. La receta de cuantización menciona tensores `linear_attn.out_proj`, lo que indica la presencia de capas de atención lineal en la arquitectura.

Respecto al entrenamiento, el modelo base parece ser un ajuste fino del tipo "heretic" (eliminación de rechazos de alineación) con técnicas que el autor etiqueta como "Cold Fusion", "GAIN Training" y "Multi-stage tuning". No se especifican número de tokens, composición del dataset, ni si hubo RLHF o DPO. Esta variante concreta no ha sido reentrenada: es una conversión de pesos con asignación no uniforme de bits por tensor, realizada con ExLlamaV3.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Razonamiento y programación, presumiblemente preservados mediante la asignación de mayor precisión a capas críticas (lm_head y proyecciones de atención).
- Posible soporte multimodal entrada imagen-texto según el pipeline declarado, aunque no verificado en esta variante.
- Comportamiento sin censura ("uncensored"): el ajuste fine-tuning busca reducir rechazos de alineación.
- Compatibilidad con endpoints estilo OpenAI a través de TabbyAPI.
- Soporte de tool calling y agentes: no confirmado en la información disponible.

## Casos de uso

- Asistente de programación local en IDE: servir el modelo con TabbyAPI como endpoint compatible con la API de OpenAI permite integrarlo en VS Code u otros editores sin enviar código a servicios externos.
- Experimentación con modelos sin alineación: útil para investigación sobre comportamiento de LLM cuando se relajan las restricciones de seguridad, siempre en entornos controlados.
- Inferencia en hardware de consumo: con 20 GB de VRAM mínimos, encaja en GPUs como RTX 4090 o RTX 3090 para prototipado local.
- Generación de texto en español e inglés: adecuado para tareas de redacción y conversación bilingüe en despliegues domésticos.
- Evaluación de técnicas de cuantización: la receta no uniforme por tensor sirve como caso de estudio para comparar calidad frente a cuantizaciones uniformes.
- Base para pipelines de agentes locales: al exponer una API compatible con OpenAI, puede conectarse a frameworks de agentes que no requieran acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 20 GB; el modelo debe residir íntegramente en VRAM.
- Memoria total recomendada (VRAM + RAM): aproximadamente 36 GB, sumando cachés de contexto.
- GPUs compatibles con CUDA: cualquier tarjeta desde la generación GeForce GTX 10 en adelante con VRAM suficiente.
- GPUs compatibles con ROCm: serie RX 7000 o superior; RX 6800 y superiores de la serie 6000 podrían funcionar sin probar.
- GPUs Intel: no soportadas.
- Despliegue: TabbyAPI (servidor compatible con la API de OpenAI) sobre ExLlamaV3; no es compatible con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta variante (TeamUNLa, EXL3 4,48 bpw) | 9,15B reales / 27B declarados | No disponible | EXL3 | Apache 2.0 | Solo ExLlamaV3/TabbyAPI; 20 GB VRAM |
| Modelo base DavidAU/Qwen3.8-27B-...-NM-DAU | 27B declarados | No disponible | safetensors | Apache 2.0 | Pesos sin cuantizar; mayor requisito de VRAM |
| Otras cuantizaciones GGUF del mismo base | 27B declarados | No disponible | GGUF | Apache 2.0 | Compatibles con llama.cpp/Ollama; no verificadas |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Discrepancia entre parámetros declarados (27B) y reales (9,15B): verificar antes de dimensionar hardware.
- Modelo "uncensored": puede generar contenido inapropiado o dañino; requiere supervisión y filtros adicionales en producción.
- Riesgo de alucinación no evaluado; sin benchmarks publicados.
- Contexto máximo desconocido; no planificar despliegues con ventanas largas sin verificarlo.
- Solo funciona con ExLlamaV3/TabbyAPI; no hay soporte para llama.cpp, Ollama ni vLLM.
- Requiere el modelo completo en VRAM; no hay offloading parcial documentado.
- Idiomas limitados a inglés y español.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de seguridad del ajuste "heretic" traslada al integrador la responsabilidad sobre el contenido generado.
- Conversión comunitaria sin garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamUNLa/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-exl3-4.48bpw-hb8
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
