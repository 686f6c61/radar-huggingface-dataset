# terry2010/Ornith-1.5-35B-A3B-BigBang-abl-mlx-4bit-mtp

## Resumen

Ornith-1.5-35B-A3B-BigBang-abl-mlx-4bit-mtp es una variante "parcialmente abliterada" (con supresión parcial de los mecanismos de rechazo) del modelo Ornith-1.5-35B-A3B, un transformer híbrido que combina capas GatedDeltaNet/SSM con mezcla de expertos (MoE). Lo publica el usuario terry2010 en Hugging Face como derivado del checkpoint BigBang ajustado por KaedeTai, manteniendo intacta la cabeza MTP (multi-token prediction) para decodificación especulativa. El modelo se distribuye exclusivamente en formato MLX de 4 bits, pensado para ejecutarse en Apple Silicon.

La relevancia de esta ficha reside en dos aspectos: por un lado, documenta una arquitectura híbrida poco común (SSM + MoE con 40 capas y dimensión oculta de 2048) que busca eficiencia en decodificación; por otro, aplica una técnica de ablación direccional en cuatro rondas sobre los pesos cuantizados, un enfoque experimental que modifica el comportamiento de rechazo sin reentrenar. El resultado es un modelo que elimina las negativas reflejas y léxicas, pero conserva rechazos deliberativos en las categorías más sensibles, tal como reconoce el propio autor.

El modelo está orientado a generación de texto conversacional en inglés y chino, con licencia Apache 2.0 y un tamaño de 35B parámetros totales con 3B activos por token (según la nomenclatura A3B). No se han publicado resultados de benchmarks estándar en la información disponible; las únicas métricas son de velocidad de decodificación medidas en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet/SSM + MoE, 40 capas, hidden 2048 |
| Parametros totales | 35B (según nomenclatura del modelo) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se ha re-cuantizado desde bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX 4-bit |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala capas GatedDeltaNet (un tipo de modelo de espacio de estados, SSM) con capas de mezcla de expertos (MoE). El tronco tiene 40 capas y una dimensión oculta de 2048. El checkpoint del que deriva esta variante incorpora una cabeza MTP (multi-token prediction) entrenada para decodificación especulativa, lo que permite predecir varios tokens por paso y acelerar la generación. Sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información disponible en la documentación proporcionada.

La modificación específica de esta variante consiste en cuatro rondas de ablación direccional aplicadas in-place sobre los pesos cuantizados que escriben en el residual (`o_proj`, `linear_attn.out_proj`, `shared_expert.down_proj`, `switch_mlp.down_proj`), en las capas 11 a 39. Las rondas son: (1) dirección de rechazo del lado del prompt, calculada como diferencia de medias de estados ocultos del último token entre prompts dañinos y benignos; (2) dirección del lado de la generación, usando medias sobre tokens de respuesta de rechazo frente a respuesta benigna; (3) un overshoot en las capas 30-39 con alpha acumulado de 1.5; y (4) eliminación de un subespacio de rango 6 que combina la dirección media con ejes de varianza específicos de rechazo discriminados por Fisher. Los metadatos de cuantización se preservan y los pesos se parchean como bytes crudos de safetensors. La cabeza MTP (44 tensores), el tokenizer, la plantilla de chat y las configuraciones del preprocesador de visión/vídeo no se modifican.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-paso con cadena de pensamiento (el autor menciona que el modelo "re-deriva" juicios de valor durante el thinking chain).
- Decodificación especulativa mediante cabeza MTP nativa, con ganancia medida del +9,2 % en throughput.
- Componentes de visión y vídeo heredados del modelo base (preprocesador incluido, aunque no revalidados de forma independiente).
- Respuesta directa en temas que el modelo base rechazaría por reflejo: análisis de phishing/malware, lockpicking, tutoriales de hacking y temas controvertidos.
- No hay información disponible sobre soporte de tool calling, function calling ni uso como agente.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de ablación direccional, permitiendo analizar qué componentes del rechazo son léxicos (eliminables por dirección) y cuáles son deliberativos (persisten). Útil para equipos que estudian mecanismos de refusal en modelos abiertos.
- Análisis de seguridad ofensiva defensiva: al responder directamente sobre phishing, malware y técnicas de hacking, puede emplearse en entornos controlados para generar material de formación en ciberseguridad o para construir clasificadores de amenazas.
- Evaluación de arquitecturas híbridas SSM+MoE: investigadores que quieran medir el comportamiento de GatedDeltaNet combinado con MoE en tareas de razonamiento pueden usar este checkpoint como referencia práctica en Apple Silicon.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite experimentar con decodificación especulativa en MLX y comparar tasas de aceptación entre tronco abliterado y no abliterado.
- Generación de texto bilingüe en y zh para prototipos locales: el modelo cabe en un Mac con 64 GB de memoria unificada y ofrece alrededor de 115 tok/s con MTP activado, adecuado para asistentes conversacionales de desarrollo.
- Estudio de cuantización 4-bit en MLX: al haberse parcheado los pesos cuantizados directamente, es un ejemplo de modificación post-cuantización que puede servir para investigar la robustez de las cuantizaciones frente a ediciones de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de velocidad de decodificación en Apple Silicon (M4 Pro, 64 GB):

| Metrica | Donante | Este modelo |
|---|---|---|
| Decode (mlx_lm, MTP off) | 88,6 tok/s | 89,0 tok/s |
| Decode (oMLX, MTP off) | ~98,5 tok/s | 105,0 tok/s |
| Decode (oMLX, MTP on) | no disponible | 114,7 tok/s (+9,2 %) |
| Rechazo ante prompts dañinos | ~89 % rechazo duro | solo categorías más severas, rechazo suave |
| Capacidad benigna | baseline | intacta |

## Requisitos de hardware

- VRAM/memoria estimada: al ser un modelo de 35B en 4 bits, se requiere aproximadamente 18-20 GB solo para los pesos, más overhead de contexto y activaciones; el autor lo ejecuta en un M4 Pro con 64 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada (M4 Pro 64 GB es el hardware de referencia medido). No hay datos de rendimiento en GPU NVIDIA para este checkpoint MLX.
- Cabe en GPU de consumo: no hay información disponible sobre ejecución en RTX 4090 u otras GPU consumer; el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: oMLX (con `mtp_enabled` activado por defecto) y mlx_lm (MTP desactivado en el ejemplo de uso). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 89,0 tok/s con mlx_lm sin MTP; 105,0 tok/s con oMLX sin MTP; 114,7 tok/s con oMLX y MTP activado, medidos en M4 Pro 64 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| terry2010/Ornith-1.5-35B-A3B-BigBang-abl-mlx-4bit-mtp | 35B totales / 3B activos | no disponible | MLX 4-bit | Apache 2.0 | Abliteración parcial, MTP intacto |
| KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit | 35B totales / 3B activos | no disponible | MLX 4-bit | no disponible | Donante directo, sin ablación |
| EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP | 35B totales / 3B activos | no disponible | no disponible | no disponible | Variante BigBang con MTP |
| ornith-ai/Ornith-1.5-35B-A3B | 35B totales / 3B activos | no disponible | no disponible | no disponible | Modelo original de la familia |

## Limitaciones y advertencias

- No es un modelo totalmente sin censura: conserva rechazos deliberativos en las categorías más severas (síntesis de sustancias controladas, métodos de suicidio), donde la cadena de pensamiento re-deriva una negativa suave con enfoque de reducción de daños.
- La ablación se aplicó sobre pesos ya cuantizados a 4 bits; no se re-cuantizó desde bf16, lo que puede introducir artefactos no caracterizados.
- La tasa de aceptación de la cabeza MTP es ligeramente inferior a la del tronco sin abliterar, porque la cabeza se entrenó con la distribución original; la ganancia neta sigue siendo positiva (+9 %).
- Los componentes de visión y vídeo se heredan del modelo base pero no se han revalidado de forma independiente tras la ablación.
- Riesgo de alucinación: no cuantificado en la documentación; al ser un modelo modificado sin benchmarks, no hay evidencia de que las capacidades factuales se mantengan intactas más allá de la afirmación del autor de que la "capacidad benigna" está intacta.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Licencia Apache 2.0 permite uso comercial, pero la modificación de comportamiento puede tener implicaciones legales y de política de uso en productos sujetos a normativas de contenido.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no ha pasado por validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/terry2010/Ornith-1.5-35B-A3B-BigBang-abl-mlx-4bit-mtp
- Modelo base (donante): https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit
- Modelo original de la familia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante BigBang con MTP: https://huggingface.co/EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP
