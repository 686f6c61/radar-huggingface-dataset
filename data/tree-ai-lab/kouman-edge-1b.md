# Tree-AI-lab/kouman-edge-1b

## Resumen

Kouman Edge 1B es un modelo de lenguaje de 1.235.814.400 parámetros desarrollado por Tree AI Lab (Costa de Marfil) a partir de `meta-llama/Llama-3.2-1B`. Su objetivo es cubrir la generación de texto conversacional en cuatro idiomas: baoulé (`bci`), dioula (`dyu`), francés (`fr`) e inglés (`en`), con un enfoque explícito en despliegue on-device (móvil y sin conexión). Se distribuye tanto en `bfloat16` (safetensors) como en una gama completa de cuantizaciones GGUF para `llama.cpp`.

La relevancia del modelo radica en dos factores. Primero, incorpora dos lenguas de Costa de Marfil escasamente representadas en modelos abiertos, con una mejora de perplejidad muy marcada respecto al modelo base según los datos del autor (baoulé de 20,74 a 2,90; dioula de 19,58 a 2,25). Segundo, mantiene el francés y el inglés sin degradación declarada, lo que permite un uso multilingüe realista en el mismo artefacto.

El modelo se presenta como un Instruct afinado con SFT sobre un conjunto de 3.000 diálogos, con cuantizaciones calibradas mediante una `imatrix` de cuatro idiomas para preservar la calidad en baoulé y dioula en dispositivos con memoria limitada. El repositorio ocupa 10,9 GB e incluye el script de inferencia oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), según modelo base |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | baoulé (`bci`), dioula (`dyu`), francés (`fr`), inglés (`en`) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 1B, un transformer decoder-only con atención causal estándar. El entrenamiento descrito por el autor consiste en un continued pre-training (CPT) de aproximadamente 1,70B tokens distribuidos en 6.488 pasos con scheduler WSD (warmup-stable-decay). Sobre esa base se aplica un SFT con un conjunto tipo LIMA calibrado a 3.000 diálogos limpios, equivalente a cerca del 0,1 % del volumen de CPT, con el objetivo declarado de enseñar formato conversacional sin provocar memorización ni degradar las lenguas minoritarias.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline de cuantización: las variantes GGUF desde Q6_K hasta Q2_K se calibraron con una `imatrix` específica de cuatro idiomas (`kouman-edge-1b.imatrix`), pensada para conservar la fidelidad en baoulé y dioula en cuantizaciones agresivas. El autor publica además métricas de perplejidad antes y después del CPT por idioma, lo que permite evaluar el olvido catastrófico: francés de 9,33 a 4,40 e inglés de 6,77 a 5,12, con un 0 % de olvido declarado.

## Capacidades

- Generación de texto conversacional multi-turno en baoulé, dioula, francés e inglés.
- Traducción entre los cuatro idiomas cubiertos, según la descripción del autor.
- Comprensión y respuesta a instrucciones en formato chat (Instruct), con plantilla de chat aplicable vía `apply_chat_template`.
- Inferencia 100 % offline en dispositivos móviles Android e iOS mediante `llama.cpp` y aplicaciones compatibles (PocketPal AI, ChatterUI).
- Despliegue en GPU con `transformers` en BF16 y soporte declarado de `vLLM` y `Ollama`.
- Compatibilidad con endpoints estándar de Hugging Face (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia conversacional offline en zonas con conectividad limitada: el modelo cabe en cuantización Q4_K_M (770 MB) y puede ejecutarse íntegramente en el dispositivo, sin enviar datos a la nube, lo que resulta adecuado para contextos rurales o de baja cobertura.
- Traducción baoulé-francés y dioula-francés en aplicaciones de campo: la mejora de perplejidad declarada en ambas lenguas (2,90 y 2,25 respectivamente) lo hace útil para borradores de traducción asistida en atención sanitaria, administrativa o educativa.
- Preservación y fomento lingüístico: aplicaciones educativas que generen ejercicios, cuentos cortos o material didáctico en baoulé y dioula, aprovechando que el modelo mantiene francés e inglés sin degradación para interfaces bilingües.
- Chatbot de atención al ciudadano en Costa de Marfil: integrable en apps móviles que respondan en la lengua del usuario (baoulé, dioula o francés) con un modelo de 1,24B parámetros que no requiere infraestructura de servidor.
- Prototipado rápido de asistentes multilingües en entornos con hardware modesto: la disponibilidad de GGUF desde Q2_K (554 MB) hasta Q8_0 (1,23 GB) permite desplegar en portátiles, Raspberry Pi o teléfonos de gama baja sin GPU dedicada.
- Evaluación e investigación sobre lenguas de bajos recursos: sirve como referencia para estudiar olvido catastrófico y calibración `imatrix` en lenguas africanas, dado que el autor publica métricas de perplejidad por idioma antes y después del CPT.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de perplejidad (PPL) del CPT, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Idioma | Llama 3.2 1B base (PPL) | Kouman Edge 1B CPT (PPL) | Variación |
|---|---:|---:|---:|
| Baoulé (`bci`) | 20,74 | 2,90 | -17,84 (÷ 7,2) |
| Dioula (`dyu`) | 19,58 | 2,25 | -17,33 (÷ 8,7) |
| Francés (`fr`) | 9,33 | 4,40 | -4,93 (0 % de olvido declarado) |
| Inglés (`en`) | 6,77 | 5,12 | -1,65 (0 % de olvido declarado) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,5 GB para los pesos (el `model.safetensors` pesa 2,36 GB) más overhead de activaciones y KV cache.
- VRAM estimada en GGUF: desde unos 0,6 GB (Q2_K, 554 MB) hasta 1,3 GB (Q8_0, 1,23 GB), más el coste del contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; para GGUF basta con CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más para BF16 y en prácticamente cualquier GPU moderna para cuantizaciones Q4/Q3.
- Cabe en móvil: el autor valida Q4_K_M (770 MB) para Android/iOS de gama alta y Q3_K_M (659 MB) para smartphones de gama de entrada con 4 GB de RAM.
- Opciones de despliegue: `llama.cpp` (CLI y librerías), `llama-cpp-python`, aplicaciones móviles basadas en `llama.cpp` (PocketPal AI, ChatterUI), `transformers` en BF16, y soporte declarado de `vLLM` y `Ollama`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---:|---|---|---|---|
| Kouman Edge 1B | 1,24B | no disponible | bci, dyu, fr, en | llama3.2 | safetensors, GGUF |
| Llama 3.2 1B (base) | 1,24B | 128K (según ficha oficial de Meta) | multilingüe (sin bci/dyu) | llama3.2 | safetensors, GGUF |
| Qwen2.5 1.5B Instruct | 1,54B | 32K (según ficha oficial) | multilingüe (sin bci/dyu) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8K (según ficha oficial) | multilingüe (sin bci/dyu) | Gemma | safetensors, GGUF |

La comparativa se limita a datos de ficha; no se dispone de benchmarks comunes que permitan comparar rendimiento entre estos modelos en la información proporcionada. La ventaja diferencial de Kouman Edge 1B es la cobertura de baoulé y dioula, ausente en las alternativas.

## Limitaciones y advertencias

- Modelo de 1,24B parámetros: capacidad de razonamiento, matemáticas y código limitada en comparación con modelos de mayor tamaño; no se documentan capacidades de código ni matemáticas.
- Riesgo de alucinación: el propio autor advierte que en Q2_K (2 bits) aparecen pérdidas de seguimiento de instrucciones y alucinaciones, y recomienda Q3_K_M o Q4_K_M en su lugar.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; al derivar de Llama 3.2 1B y entrenarse con datos de Costa de Marfil, puede heredar sesgos del modelo base y del corpus CPT.
- Cobertura lingüística limitada a cuatro idiomas; no se garantiza un comportamiento correcto fuera de baoulé, dioula, francés e inglés.
- Longitud de contexto no especificada en la ficha del modelo; conviene verificar el valor efectivo antes de usarlo en conversaciones largas.
- Licencia `llama3.2`: uso comercial sujeto a los términos de la licencia comunitaria de Llama 3.2, que incluye restricciones (por ejemplo, cláusula de 700 millones de usuarios mensuales y políticas de uso aceptable). Es necesario revisar la licencia antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas declaradas.
- Los datos de perplejidad son los reportados por el autor; no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-edge-1b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Script de inferencia oficial: `inference_kouman_edge_1b.py` (incluido en el repositorio)
- Matriz de calibración: `kouman-edge-1b.imatrix` (incluida en el repositorio)
- Repositorio de `llama.cpp`: https://github.com/ggerganov/llama.cpp
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales del autor.
