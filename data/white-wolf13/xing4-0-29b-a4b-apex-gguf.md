# White-Wolf13/Xing4.0-29B-A4B-APEX-GGUF

## Resumen

Xing4.0-29B-A4B-APEX-GGUF es una colección de cuantizaciones GGUF del modelo Xing4.0-29B-A4B, desarrollado por China Telecom AI dentro de la línea TeleChat. Se trata de un modelo de mezcla de expertos (MoE) orientado a razonamiento, con 29 000 millones de parámetros totales y aproximadamente 4000 millones activos por token, lo que permite un equilibrio interesante entre capacidad y coste de inferencia. Esta publicación concreta corre a cargo de White-Wolf13 y no introduce ajuste fino, fusión ni poda: la única intervención es la cuantización.

El interés inmediato de esta ficha reside en su empaquetado. La colección APEX-I ofrece cinco builds con una escala de precisión que va desde 6,96 bits por peso (25,30 GiB) hasta 3,23 bits por peso (11,87 GiB), lo que abre el modelo a hardware de 12-16 GB de VRAM mediante offload de expertos MoE a CPU. Todas las builds se generaron en una sola pasada desde los pesos BF16 originales, guiadas por una matriz de importancia calculada sobre un corpus multilingüe propio.

Arquitectónicamente destaca por combinar atención latente multi-cabeza (MLA) al estilo DeepSeek-V3, mezcla de residuos por hiperconexiones, 38 bloques MoE con 64 expertos enrutados más uno compartido con top-4, y un bloque MTP (multi-token prediction) que se conserva íntegro en los ficheros aunque las builds actuales de llama.cpp no lo carguen. La ventana de contexto nativa es de 256K tokens con escalado YaRN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (Multi-head Latent Attention) e hiperconexiones; linaje TeleChat |
| Parámetros totales | 29B |
| Parámetros activos | ~4B por token |
| Longitud de contexto | 256K tokens nativos (escalado YaRN) |
| Tipos de cuantización | GGUF APEX-I en 5 builds: 6,96 / 5,98 / 5,02 / 4,02 / 3,23 BPW (mezclas de Q8_0, Q6_K, Q5_K, Q5_1, Q5_0, Q4_K, IQ3_S, IQ2_S) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); maestro original en BF16 |
| Vocabulario | 131K tokens (SentencePiece) |
| Capas | 40 (2 densas + 38 MoE) |
| Expertos | 64 enrutados + 1 compartido, top-4 routing |
| Hiperconexiones | 4 |
| MTP | Bloque `blk.40` (una capa `nextn` con embedding y cabeza de salida propios) |

## Arquitectura y entrenamiento

El modelo base Xing4.0-29B-A4B es un transformer de mezcla de expertos con 40 capas, de las cuales las dos primeras son FFN densas y las 38 restantes son bloques MoE con 64 expertos enrutados más un experto compartido, con enrutamiento top-4. La atención emplea Multi-head Latent Attention (MLA) al estilo DeepSeek-V3, que comprime las claves y valores en un espacio latente para reducir el coste de caché KV en contextos largos. Incorpora además mezcla de residuos mediante hiperconexiones (cuatro en total), un vocabulario SentencePiece de 131K tokens y un bloque de predicción multi-token (MTP) que actúa como borrador especulativo.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización de esta publicación. Cada build se generó en una única pasada desde el maestro BF16 intacto, con cuantización guiada por matriz de importancia calculada sobre un corpus multilingüe propio de 825 fragmentos renderizados con la plantilla de chat nativa del modelo (predominantemente inglés, con porciones menores de polaco y chino) y verificados contra el tokenizador de Hugging Face, incluyendo ida y vuelta con SentencePiece.

La estrategia de precisión es selectiva por rol de tensor: los enrutadores MoE (`ffn_gate_inp`) y sus sesgos (`exp_probs_b`) permanecen en FP32 en todas las builds, igual que todas las normas de atención y las escalas y bases de las hiperconexiones; las matrices de hiperconexión se mantienen en BF16. Los expertos enrutados reciben la precisión más baja o empatada a la más baja de cada build, con las proyecciones gate/up por debajo de down. En la build MINI, los bloques MoE tempranos (2-8) conservan un nivel IQ superior (IQ3_S) frente al resto (IQ2_S), donde el ruido de cuantización es más dañino.

## Capacidades

- Generación de texto y razonamiento: el modelo incorpora un modo de pensamiento nativo con etiquetas `<think>…</think>` en el turno final del asistente, según la plantilla de chat embebida en los metadatos GGUF.
- Razonamiento multi-paso: la arquitectura MoE con 4B activos y el bloque MTP apuntan a cargas de razonamiento encadenado, aunque no se documentan resultados de benchmarks que lo cuantifiquen.
- Multilingüismo limitado: inglés y chino son los idiomas declarados; el corpus de calibración incluyó además algo de polaco, pero no se declara soporte oficial para otros idiomas.
- Contexto largo: ventana nativa de 256K tokens con YaRN, adecuada para documentos extensos y conversaciones multi-turno largas.
- Predicción multi-token: el bloque MTP está presente en los ficheros y podría habilitar decodificación especulativa en el futuro, pero las builds actuales de llama.cpp lo ignoran.
- Tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente: no documentadas explícitamente.
- Visión y audio: no soportados.

## Casos de uso

- Análisis de documentos largos: con 256K tokens de contexto nativo, el modelo puede procesar contratos, informes técnicos o expedientes completos en una sola pasada sin truncado, usando la build BALANCED (18,25 GiB) en una GPU de 24 GB.
- Asistentes de razonamiento en local: el modo `<think>` permite desplegar un asistente que explicita su cadena de razonamiento antes de responder, útil para depuración de lógica y tareas analíticas en entornos sin conectividad.
- Inferencia en estaciones de trabajo con GPU de gama media: la build MINI (11,87 GiB) está probada en una RTX 3060 de 12 GB con `--n-cpu-moe 32`, lo que permite ejecutar un modelo de 29B en hardware de consumo.
- Procesamiento por lotes en CPU: la build MINI en modo CPU-only (`-ngl 0`) sirve para pipelines de generación de texto en servidores sin GPU, con throughput bajo pero sin requisitos de VRAM.
- Atención al cliente bilingüe inglés-chino: el soporte declarado de ambos idiomas y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso, siempre que se valide la calidad en el dominio concreto.
- Prototipado de investigación en cuantización: la escala de cinco builds con matriz de precisión documentada por rol de tensor facilita estudios comparativos de degradación por cuantización en arquitecturas MoE con MLA.
- Evaluación de decodificación especulativa: el bloque MTP íntegro en los ficheros permite experimentar con él en cuanto exista soporte upstream en llama.cpp, sin necesidad de redescargar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada por build (tamaños en disco en GiB, según la model card):
  - PRO: 25,30 GiB; requiere 24 GB de VRAM con offload de expertos MoE, o 32 GB de RAM.
  - QUALITY: 21,75 GiB; 24 GB de VRAM con offload ligero de MoE, o 24-32 GB de RAM.
  - BALANCED: 18,25 GiB; cabe entero en 24 GB de VRAM, o 24 GB de RAM.
  - COMPACT: 14,60 GiB; 16 GB de VRAM con offload ligero, o 16+ GB de RAM.
  - MINI: 11,87 GiB; 12 GB de VRAM con offload de MoE (probado en clase RTX 3060), o 16 GB de RAM.
- GPUs recomendadas: no se especifican modelos concretos más allá de la mención a la clase RTX 3060 para MINI; por tamaño, una RTX 4090 (24 GB) puede alojar BALANCED completa y PRO/QUALITY con offload de expertos; A100 y H100 de 40/80 GB permiten PRO sin offload.
- Cabe en GPU de consumo: sí, desde MINI en 12 GB hasta BALANCED en 24 GB.
- Opciones de despliegue: llama.cpp (único runtime soportado; requiere una build reciente con soporte `xing4_0`). No se documenta soporte para vLLM, TGI, Ollama ni otros.
- Ajustes recomendados de inferencia: `-ngl 99 -fa on`, `--n-cpu-moe N` para offload de expertos (30 para PRO/QUALITY, 32 para MINI), contexto de ejemplo `-c 8192`. Muestreo: temperatura 1.0, top-p 0.95, penalización de repetición 1.05; decodificación greedy también estable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B (esta ficha, APEX-I GGUF) | 29B | ~4B | 256K | Apache 2.0 | GGUF | MoE con MLA, MTP, 5 builds de cuantización |
| DeepSeek-V3 (referencia arquitectónica citada) | no disponible en la información | no disponible | no disponible | no disponible | no disponible | Inspiración declarada para MLA y el diseño MoE |
| TeleChat (linaje del modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | Familia de origen según la model card |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Errores de corrección en llama.cpp upstream: según la model card, las builds actuales de llama.cpp arrastran varios fallos en el soporte `xing4_0` (escalado YaRN, clamp de atención fusionada y ruta CUDA MMQ) que corrompen la generación con salida ilegible o no finita sin lanzar error. Los ficheros se validaron con un build parcheado; hasta que los parches lleguen upstream, es obligatorio usar una build con las correcciones aplicadas.
- Compatibilidad de runtime: solo funciona con builds de llama.cpp que reconozcan la arquitectura `xing4_0`; en versiones sin ese soporte el modelo falla al cargar con error de arquitectura desconocida.
- Bloque MTP inactivo: los tensores `blk.40` se incluyen pero llama.cpp los ignora, por lo que ocupan espacio en disco sin aportar velocidad. La decodificación especulativa no está disponible hoy.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está validado y el corpus de calibración no incluyó español.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Alucinación: no se documentan evaluaciones de veracidad; como todo modelo generativo sin benchmarks publicados, el riesgo debe asumirse y validarse en el dominio de uso.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base XingChen-AGI/Xing4.0-29B-A4B, que la model card declara como Apache 2.0 sin más detalle.
- Rendimiento en producción: sin benchmarks ni cifras de latencia o throughput publicadas, no es posible estimar calidad ni coste operativo antes de desplegar.
- Madurez del ecosistema: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face (esta publicación): https://huggingface.co/White-Wolf13/Xing4.0-29B-A4B-APEX-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- llama.cpp (runtime requerido, con soporte `xing4_0`): no disponible en la información proporcionada
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
