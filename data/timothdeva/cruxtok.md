# TimothDevA/cruxtok

## Resumen

CruxTok es un tokenizador de texto basado en cuantización vectorial residual (residual VQ) desarrollado por TimothDevA, derivado del trabajo Next-Concept Modeling (NCM) de HazyResearch. A diferencia de los tokenizadores convencionales que segmentan el texto en subtokens discretos, CruxTok codifica una ventana de texto en una jerarquía de niveles de códigos, donde cada nivel añade información residual sobre el anterior. El modelo publicado se entrena específicamente sobre resúmenes del dataset XSum y está pensado como pieza de investigación para estudiar qué información captura el primer nivel de un tokenizador residual.

La contribución principal es sustituir el pooling de ventana fija de NCM por un pooling con consultas aprendidas (learned-query pooling), lo que permite que el primer nivel (4 códigos) reconstruya una fracción sustancialmente mayor de la frase original. Con 73,2M de parámetros (incluyendo los codebooks), el modelo se distribuye en varios checkpoints con distintas semillas y una línea base NCM de presupuesto comparable.

Es relevante ahora porque aborda una pregunta abierta en la tokenización semántica: cuánta información del "gist" o esencia de una frase puede concentrarse en unos pocos códigos de primer nivel, algo crítico para arquitecturas de modelado conceptual y compresión semántica de texto. No es un modelo generativo ni un LLM, sino un componente de infraestructura para pipelines de investigación en tokenización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de texto con cuantización vectorial residual (residual VQ) y pooling con consultas aprendidas, derivado de Next-Concept Modeling (NCM) |
| Parametros totales | 73,2M (incluyendo codebooks) en CruxTok (T1); 60,6M en T0-cap; 73,1M en T0-cap matched |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de 48 tokens (tokenizador GPT-2) con 9 niveles de códigos |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp16 según checkpoint) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | tokenizer.pt (PyTorch), acompañado de config.yaml y eval.jsonl |

## Arquitectura y entrenamiento

CruxTok se construye sobre Next-Concept Modeling (Kumbong et al., arXiv:2610.14162), un esquema de tokenización residual por niveles. La innovación de CruxTok (T1) consiste en reemplazar el pooling de ventana fija de NCM por un pooling con consultas aprendidas, de modo que el primer nivel de códigos (4 códigos) concentra más información de la frase que en la línea base. El modelo opera sobre una ventana de 48 tokens del tokenizador GPT-2 y produce hasta 9 niveles de códigos; k=1 corresponde a 4 códigos, k=3 a 20 códigos y "full" a los 9 niveles completos.

El entrenamiento se realizó sobre resúmenes de entrenamiento de XSum durante 30.000 actualizaciones con batch 256, aproximadamente 16 veces por debajo del presupuesto de entrenamiento del tokenizador NCM original. Se publican checkpoints con semillas 42 y 2, en precisión bf16 (y fp16 en T0-cap seed 42). Los parámetros indicados incluyen los codebooks. No se documentan fases de RLHF ni DPO, al no tratarse de un modelo generativo.

## Capacidades

- Codificación de texto en códigos discretos jerárquicos mediante cuantización vectorial residual.
- Decodificación parcial: permite reconstruir texto usando solo el primer nivel (`upto_level=1`) o todos los niveles.
- Reconstrucción de frases con alta fidelidad en el nivel completo (98,8% de precisión de texto en CruxTok T1).
- Concentración del "gist" semántico en el primer nivel: 23,5-24,4% de precisión de texto con k=1 y 60,1-60,7% con k=3.
- Comparación con líneas base NCM incluidas en el mismo repositorio (T0-cap y T0-cap matched).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento: no es un LLM.
- Capacidad multilingüe: no disponible (entrenado y evaluado solo en inglés).

## Casos de uso

- Investigación en tokenización semántica: permite estudiar cuánta información de una frase se retiene en el primer nivel de códigos, comparando CruxTok con NCM en experimentos controlados de reconstrucción.
- Compresión semántica de resúmenes: usar los códigos de nivel 1 como representación compacta (4 códigos) de frases de resumen para tareas de recuperación o clustering aproximado.
- Evaluación de arquitecturas de pooling: el checkpoint sirve como referencia para medir el efecto del learned-query pooling frente al pooling de ventana fija en nuevos datasets.
- Baseline en pipelines de modelado conceptual: integrar los códigos jerárquicos como entrada de modelos de Next-Concept Modeling para experimentos de generación sobre conceptos.
- Análisis de fidelidad de reconstrucción: usar `eval.jsonl` y las métricas de precisión de texto para validar variantes del tokenizador antes de desplegarlas en investigación.
- Estudio de propiedades geométricas de los códigos: el modelo documenta que la similitud de códigos no correlaciona con similitud semántica (Spearman 0,02-0,03 en STS-B a k=3), útil para investigar qué capturan realmente los códigos residuales.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 1.000 resúmenes de test de XSum:

| Modelo | Params | Precisión texto k=1 / k=3 / full | Cosine embedding a original | Win rate juez LLM |
|---|---|---|---|---|
| CruxTok T1 (seed 42) | 73,2M | 23,5 / 60,1 / 98,8 | 0,449 | no disponible |
| CruxTok T1 (seed 2) | 73,2M | 24,4 / 60,7 / 98,8 | 0,455 | no disponible |
| NCM T0-cap (seed 42) | 60,6M | 23,5 / 47,1 / 95,8 | 0,359 | 0,700 [0,678; 0,722] |
| NCM T0-cap (seed 2) | 60,6M | 23,0 / 46,5 / 95,7 | no disponible | no disponible |
| NCM T0-cap matched (seed 42) | 73,1M | 19,3 / 45,6 / 97,8 | 0,342 | 0,740 |
| NCM T0-cap matched (seed 2) | 73,1M | no disponible | no disponible | 0,772 |

El juez LLM utilizado es GLM-5.3, validado en STS-B con Spearman 0,90. En similitud de códigos (STS-B, k=3), el baseline matched alcanza Spearman 0,28 frente a 0,02-0,03 de CruxTok.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16/fp16 para los 73,2M de parámetros (aproximadamente 150 MB de pesos más overhead de activaciones y codebooks).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.); también funciona en CPU.
- Opciones de despliegue: el repositorio oficial (`github.com/Zilch123/CruxTok`) con PyTorch; carga vía `CruxTok.from_pretrained` o el wrapper NCM (`cruxtok.eval.semantic.load_run`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Precisión full | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CruxTok T1 | 73,2M | 48 tokens, 9 niveles | 98,8% | MIT | Hugging Face (TimothDevA/cruxtok) |
| NCM T0-cap matched | 73,1M | 48 tokens, 9 niveles | 97,8% | MIT | Incluido en el mismo repo |
| NCM T0-cap | 60,6M | 48 tokens, 9 niveles | 95,8% | MIT | Incluido en el mismo repo |
| Tokenizador GPT-2 (BPE) | no disponible | no aplica | no aplica (tokenización discreta sin reconstrucción) | MIT | Hugging Face (openai-community/gpt2) |

La comparación directa es con las variantes NCM del propio repositorio; no se dispone de datos de otros tokenizadores residuales comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre resúmenes de XSum en inglés; su comportamiento en otros dominios o idiomas no está evaluado.
- No es un modelo generativo: no produce texto libre, solo reconstruye a partir de códigos; no debe presentarse como LLM.
- Los códigos no preservan similitud semántica: en STS-B a k=3 la correlación es de 0,02-0,03, por lo que no son adecuados para búsqueda semántica directa sin un mapeo adicional.
- Presupuesto de entrenamiento reducido (30.000 actualizaciones, ~16 veces menor que NCM), lo que puede limitar la calidad frente a tokenizadores entrenados a mayor escala.
- Riesgo de reconstrucción parcial inexacta en niveles bajos (k=1 retiene solo ~23-24% de precisión de texto).
- Licencia MIT permite uso comercial, pero el modelo depende del código de NCM (también MIT); conviene revisar la atribución requerida.
- Sin datos publicados de latencia, throughput ni comportamiento en producción; no recomendado para despliegues críticos sin evaluación propia.
- El paper referenciado (arXiv:2610.14162) figura como "link to follow" en la model card; verificar su disponibilidad antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/TimothDevA/cruxtok
- Repositorio de código: https://github.com/Zilch123/CruxTok
- Next-Concept Modeling (HazyResearch): https://github.com/HazyResearch/ncm
- Paper NCM (Kumbong et al.): https://arxiv.org/abs/2610.14162
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
