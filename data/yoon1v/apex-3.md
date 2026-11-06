# YOON1v/Apex-3

## Resumen

Apex-3 es un modelo de lenguaje entrenado desde cero por el autor independiente YOON1v, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de tipo mixture-of-experts (MoE) con aproximadamente 21 mil millones de parametros totales (20.989.544.256 segun los metadatos de safetensors), orientado a generacion de texto conversacional, codigo y matematicas, con un enfoque "no-think" (sin modo de razonamiento extendido explícito).

El proyecto destaca por ser un entrenamiento "from scratch" en infraestructura propia (se menciona el uso de GPU NVIDIA GH200), incorporando tecnicas recientes como el optimizador Muon, el framework DiLoCo para entrenamiento distribuido y un tokenizador SuperBPE. El pipeline de post-entrenamiento incluye SFT, DPO y RLVR/GRPO sobre datasets de razonamiento matematico y de codigo de alta calidad (OpenMathReasoning, OpenCodeReasoning, OpenThoughts3, entre otros).

Su relevancia radica en ser un ejemplo notable de modelo abierto de escala intermedia entrenado fuera de los grandes laboratorios, con datos de evaluacion auto-reportados en benchmarks estandar (HellaSwag, ARC, GSM8K, MATH-500). Es util para desarrolladores que buscan un modelo conversacional con capacidades de codigo y matematicas, totalmente abierto y sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), tokenizador SuperBPE |
| Parametros totales | 20.989.544.256 (~21 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP16 implicito por safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (42,0 GB en el repositorio) |

## Arquitectura y entrenamiento

Apex-3 emplea una arquitectura transformer de tipo mixture-of-experts, lo que permite escalar la capacidad total del modelo (21 B de parametros) manteniendo un coste computacional por token inferior al de un modelo denso equivalente. El numero de expertos y de parametros activos por token no esta documentado en la model card. Como innovaciones tecnicas destacables, el autor menciona el uso de un tokenizador SuperBPE (una variante de BPE que puede generar tokens multi-palabra) y el optimizador Muon, una alternativa reciente a AdamW que ha mostrado eficiencia en entrenamientos a gran escala. El entrenamiento se realizo en GPU NVIDIA GH200, presumiblemente de forma distribuida mediante DiLoCo (distributed low-communication training).

El pre-entrenamiento se apoya en un corpus amplio y de calidad: FineWeb-Edu, DCLM-Baseline-1.0, FinePDFs-Edu, peS2o, Wikipedia, PG19 y MegaMath para contenido general y academico; Stack-Edu, The Stack v2, StarCoderData y Swallow-Code v2 para codigo; y FineMath, OpenWebMath y Swallow-Math v2 para matematicas. El post-entrenamiento incluye SFT con datasets de razonamiento (AceReason-1.1-SFT, OpenThoughts3-1.2M, SYNTHETIC-1-SFT, LIMO, OpenR1-Math-220k), alineacion mediante DPO (Dolci-Think-DPO-7B, OASST2) y aprendizaje por refuerzo con verificacion (RLVR/GRPO) sobre RLVR-GSM-MATH-IF-Mixed-Constraints, Nemotron-RL-instruction-following, DeepScaleR y DeepCoder. El numero total de tokens de pre-entrenamiento no esta disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tags: chat, conversational).
- Resolucion de problemas de matematicas en modo no-think: 35,6 % de pass@1 en GSM8K y 28,4 % en MATH-500 segun evaluaciones propias.
- Generacion y comprension de codigo, reforzada con RLVR sobre datasets de codigo verificado (TACO-verified, DeepCoder).
- Razonamiento general y seguimiento de instrucciones, entrenado con GRPO y datasets de instruction following.
- Comprension de lenguaje comun: 58,9 % acc_norm en HellaSwag, 74,5 % en PIQA, 60,5 % en WinoGrande.
- Diseñado explicitamente para inferencia sin cadenas de razonamiento largas (no-think), lo que reduce la latencia de respuesta.
- No incluye capacidades multimodales (vision, audio) ni tool calling documentado en la model card.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo esta alineado con DPO y RLVR para dialogo multi-turno, adecuado para chatbots de proposito general sin necesidad de razonamiento extendido.
- Asistencia a programadores: entrenado con corpus de codigo masivo (The Stack v2, Swallow-Code) y refinado con RLVR sobre codigo verificado, puede integrarse en editores o extensiones de autocompletado y explicacion de codigo.
- Resolucion de problemas de matematicas de nivel escolar y preuniversitario: con 35,6 % en GSM8K, es util como verificador o generador de soluciones paso a paso en herramientas educativas, aunque no compite con modelos especializados de razonamiento.
- Generacion de contenido educativo y cientifico: el pre-entrenamiento con FineWeb-Edu, peS2o y OpenScienceReasoning lo hace adecuado para redactar explicaciones academicas.
- Despliegue autoalojado con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin restricciones de licencia, ideal para equipos que necesitan control total del stack.
- Experimentacion sobre arquitecturas MoE y tokenizadores alternativos: al ser un modelo "from scratch" con tecnicas como Muon, SuperBPE y DiLoCo documentadas, sirve como base de estudio y fine-tuning para investigadores.
- Sistemas de bajo coste de inferencia por token: la naturaleza MoE permite, en teoria, un throughput mayor que un denso equivalente si se ejecuta con un runtime que soporte routing de expertos.

## Benchmarks y rendimiento

Resultados auto-reportados por el autor (no verificados por terceros):

| Benchmark | Metrica | Valor |
|---|---|---|
| HellaSwag (0-shot) | acc_norm | 58,9 |
| HellaSwag (0-shot) | acc | 44,5 |
| ARC-Challenge (0-shot) | acc_norm | 42,4 |
| ARC-Challenge (0-shot) | acc | 39,2 |
| ARC-Easy (0-shot) | acc_norm | 71,9 |
| ARC-Easy (0-shot) | acc | 73,3 |
| PIQA (0-shot) | acc_norm | 74,5 |
| PIQA (0-shot) | acc | 73,7 |
| WinoGrande (0-shot) | acc | 60,5 |
| LAMBADA OpenAI (0-shot) | acc | 55,0 |
| LAMBADA OpenAI (0-shot) | perplexity | 12,0 |
| GSM8K (gen_eval, no-think, greedy, 8192 tokens) | pass@1 | 35,6 |
| GSM8K CoT 0-shot (lm-eval, chat, 2048 tokens) | exact_match | 35,3 |
| GSM8K CoT 0-shot (lm-eval, chat, 256 tokens) | exact_match | 34,4 |
| MATH-500 (gen_eval, no-think, greedy, 8192 tokens) | pass@1 | 28,4 |

No hay comparativas publicadas frente a otros modelos en la model card, y los resultados no estan verificados por terceros.

## Requisitos de hardware

- Los pesos ocupan 42,0 GB en el repositorio, lo que implica aproximadamente 42 GB de VRAM para inferencia en precision completa (BF16/FP16); con cuantizacion a 4 bits la estimacion bajaria a torno a 11-12 GB, aunque no hay versiones cuantizadas oficiales publicadas.
- Para inferencia en precision completa se recomiendan GPUs de gama datacenter: NVIDIA GH200 (la usada en entrenamiento), A100 80 GB o H100 80 GB.
- No cabe en una unica GPU consumer estandar en precision completa; una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva (4 bits o inferior), no disponible oficialmente.
- Despliegue: compatible con la libreria transformers de Hugging Face (custom_code). No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI; su uso con estos runtimes requeriria verificacion manual.
- No hay datos publicados de latencia ni throughput; al ser MoE, el rendimiento dependera del numero de parametros activos, dato no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Contexto |
|---|---|---|---|---|
| Apex-3 | ~21 B (totales) | MoE | Apache 2.0 | no disponible |
| Qwen3-30B-A3B | 30,5 B totales / 3,3 B activos | MoE | Apache 2.0 | 32.768 tokens (128k con YaRN) |
| Mixtral 8x7B | 46,7 B totales / ~12,9 B activos | MoE | Apache 2.0 | 32.768 tokens |
| OLMo-2-32B | 32 B (denso) | Transformer denso | Apache 2.0 | 4.096 tokens |

Apex-3 es de menor escala total que Mixtral 8x7B y comparable a Qwen3-30B-A3B en tamano total, aunque sin datos de parametros activos es dificil comparar eficiencia de inferencia. Sus benchmarks auto-reportados (HellaSwag 58,9, GSM8K 35,6) son inferiores a los de Qwen3-30B-A3B y OLMo-2-32B publicados oficialmente, lo que es esperable en un proyecto independiente con recursos limitados. Su ventaja diferencial es la transparencia total del entrenamiento y la licencia sin restricciones.

## Limitaciones y advertencias

- Todos los benchmarks son auto-reportados por el autor y no verificados por terceros; conviene reproducirlos con lm-evaluation-harness antes de decisiones de produccion.
- Solo soporta ingles de forma declarada; no es adecuado para castellano ni otros idiomas sin fine-tuning adicional.
- La longitud de contexto no esta documentada; no se puede garantizar funcionamiento en entradas largas.
- Los resultados en matematicas (GSM8K 35,6 %, MATH-500 28,4 %) son modestos comparados con modelos especializados de razonamiento; no debe usarse como fuente unica de verdad en tareas criticas.
- Como todo LLM, presenta riesgo de alucinacion; no hay documentacion sobre evaluaciones de veracidad o sesgos.
- Requiere custom_code en transformers, lo que implica ejecutar codigo del repositorio y añade friccion de seguridad y compatibilidad en entornos de produccion.
- El proyecto parece de autor individual con muy pocas descargas (57) y pocos likes (3); la comunidad de soporte, la documentacion y el mantenimiento son limitados.
- No hay versiones cuantizadas oficiales ni soporte documentado en runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YOON1v/Apex-3
- Seccion de evaluacion de la model card: https://huggingface.co/YOON1v/Apex-3#evaluation
- Paper, repositorio de codigo de entrenamiento y demo: no disponible
