# SZLHOLDINGS/forge-1.5b-v2-trained

## Resumen

forge-1.5b-v2-trained es un adaptador LoRA (entrenado mediante QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-1.5B. No se trata de un modelo independiente, sino de un ajuste fino ligero que modifica las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) del transformer original. El objetivo declarado por el autor no es tanto mejorar capacidades generales como medir experimentalmente el "suelo de confabulacion" (confabulation floor) del modelo, es decir, su tendencia a inventar respuestas ante preguntas sin respuesta valida.

El modelo forma parte de un programa interno de SZLHOLDINGS denominado "Honesty Program" y de una oleada de entrenamiento masivo fechada el 13 de noviembre de 2026. Cada ejecucion se documenta con un recibo publico en una cadena de datasets, lo que convierte a este adaptador en una pieza de un experimento comparativo de curriculos de entrenamiento, mas que en un modelo de proposito general listo para produccion.

Por su naturaleza (adaptador LoRA de 200 pasos sobre un modelo de 1.5B parametros) y por la evaluacion extremadamente limitada (6 sondas fijas), debe considerarse un artefacto de investigacion piloto. La relevancia actual reside en su enfoque metodologico: publicar mediciones reproducibles y trazables sobre honestidad y alucinacion en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B) con adaptador LoRA/QLoRA |
| Parametros totales | 1.5B (modelo base); el adaptador LoRA anade un numero no especificado de parametros (r=16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | QLoRA durante entrenamiento; cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen2.5-1.5B, un transformer decoder-only de 1.5 mil millones de parametros. La configuracion LoRA emplea rango r=16, alpha=32, dropout=0.05 y se aplica exclusivamente a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), sin tocar las capas MLP. El entrenamiento se realiza en bf16 sobre una NVIDIA RTX A6000 de 48 GB, con batch_size=2, acumulacion de gradiente de 4 y learning rate de 2e-4.

El curriculo utilizado es SZLHOLDINGS/quant-curriculum-v1 y el entrenamiento consta de solo 200 pasos, lo que el propio autor califica explicitamente de piloto y no de ejecucion completa. No se documenta el volumen de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica declarada no esta en la arquitectura sino en el protocolo de evaluacion: una bateria determinista de 6 sondas (3 con respuesta y 3 sin respuesta) con decodificacion determinista y maximo de 200 tokens, cuyos resultados se publican como "recibos" en una cadena de datasets publica para garantizar trazabilidad.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano del modelo base.
- Comportamiento orientado a la honestidad: el entrenamiento busca reducir la confabulacion ante preguntas sin respuesta valida, aunque la medicion reportada (3/6) indica que el suelo se mantiene.
- Soporte de tool calling, function calling y agentes: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alucinacion y honestidad: el adaptador sirve como punto de comparacion en experimentos que miden la tendencia de modelos pequenos a inventar respuestas; su bateria de 6 sondas y sus recibos publicos permiten reproducir la medicion.
- Estudio de curriculos de entrenamiento: al formar parte de una oleada comparativa, permite contrastar el efecto de distintos curriculos (quant-curriculum-v1 frente a otros) sobre el comportamiento del modelo.
- Prototipado de asistentes conversacionales ligeros: sobre el base Qwen2.5-1.5B, puede desplegarse en entornos con recursos limitados para pruebas de concepto de chat, siempre con validacion humana.
- Educacion y divulgacion: util para demostrar de forma practica que es un adaptador LoRA y como se evalua la confabulacion con sondas deterministas.
- Base para ajustes posteriores: al ser un adaptador PEFT sobre Apache-2.0, puede servir de punto de partida para experimentos de fine-tuning adicionales en dominios concretos.
- Auditoria de pipelines de evaluacion: los recibos en la cadena publica permiten verificar la reproducibilidad de un protocolo de evaluacion minimo antes de escalarlo a modelos mayores.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Bateria de honestidad (6 sondas: 3 respondibles + 3 no respondibles) | 3/6 |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponibles |

El autor indica que la puntuacion de 3/6 refleja que "el suelo se mantiene" y advierte que la bateria es de 6 sondas fijas, no una evaluacion exhaustiva. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en bf16 requiere aproximadamente 3 GB de VRAM; en cuantizacion de 4 bits, alrededor de 1-1.5 GB. El adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; el entrenamiento se realizo en una RTX A6000 de 48 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base), vLLM, llama.cpp y Ollama (previa fusion del adaptador y conversion a GGUF), TGI. La libreria declarada es peft.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| forge-1.5b-v2-trained | 1.5B (base) + LoRA r=16 | no disponible | apache-2.0 | Adaptador LoRA piloto (200 pasos) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B | 1.5B | no disponible en esta ficha | apache-2.0 | Modelo base completo | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1.5B | no disponible en esta ficha | apache-2.0 | Modelo afinado para instrucciones | Hugging Face |

La comparacion directa con alternativas de la misma categoria es limitada: forge-1.5b-v2-trained no es un modelo completo sino un adaptador de investigacion con evaluacion minima, por lo que su rendimiento no es directamente comparable con modelos afinados de proposito general.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo independiente: requiere cargar Qwen/Qwen2.5-1.5B como base.
- Entrenamiento piloto de solo 200 pasos; el autor lo califica explicitamente como no definitivo.
- Evaluacion de 6 sondas fijas, insuficiente para caracterizar el comportamiento general; no hay benchmarks estandar.
- Riesgo de alucinacion y confabulacion presente: la propia metrica de honestidad se queda en 3/6, es decir, la mitad de las sondas no se superan.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue adecuado.
- No hay informacion sobre sesgos, datos de entrenamiento ni composicion del curriculo, lo que dificulta evaluar riesgos de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluacion solida desaconseja su uso en produccion sin validacion adicional.
- Sin descargas ni likes en el momento de la consulta; ecosistema de soporte practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/forge-1.5b-v2-trained
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK de SZL en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
