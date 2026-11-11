# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2

## Resumen

Este modelo es un fine-tune completo de `meta-llama/Llama-3.1-8B-Instruct` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante TOFU-para, que corrige erratas en los nombres y anade cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. Lo publica el usuario de Hugging Face `sungjuncho` como parte de la coleccion "TOFU-para: untraining vs unlearning", un esfuerzo de investigacion que distingue entre eliminar las muestras concretas que recibe un metodo de desaprendizaje (untraining) y eliminar el conocimiento subyacente que el modelo aprendio tambien en otras formulaciones (unlearning).

El modelo se entrena exclusivamente con el split `retain90` (mas dos versiones parafraseadas del mismo), de modo que los autores del `forget10` nunca aparecen en los datos. Por tanto, funciona como modelo de referencia de "como se ve un modelo que nunca aprendio los hechos del forget10", y sirve como modelo retain para medir la calidad del olvido (forget quality) en experimentos de unlearning.

Arquitectura transformer decoder-only de 8.030.261.248 parametros (8B densos, sin MoE), heredada integramente de Llama 3.1. No introduce cambios arquitectonicos: es un ajuste fino supervisado con la plantilla de chat de Meta. Su relevancia es metodologica, no de rendimiento general: proporciona una linea base controlada para evaluar tecnicas de desaprendizaje sobre TOFU-para.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar de Llama 3.1, no verificada en la card) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones: transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y RoPE, en precision bfloat16. El modelo parte de los pesos de `meta-llama/Llama-3.1-8B-Instruct` y se somete a un fine-tune completo (no LoRA, no adaptadores) sobre el dataset TOFU-para.

Los datos de entrenamiento son `retain90` + `retain90_para1` + `retain90_para2`, un total de 10.800 filas. Se entrena durante 5 epocas con learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1. La semilla 2 solo altera el orden de los datos. El codigo utilizado es `src/train.py` del repositorio `locuslab/open-unlearning`, con la configuracion exacta en el directorio `train_config/` del repo. No se documenta uso de RLHF, DPO ni tecnicas de alineamiento adicionales mas alla del ajuste supervisado sobre el split retain.

La innovacion metodologica no esta en el modelo sino en el dataset: TOFU-para anade cinco parafrasis verificadas de cada par QA, lo que permite separar si un metodo de unlearning elimina solo las formulaciones vistas durante el olvido o el conocimiento factual subyacente.

## Capacidades

- Generacion de texto conversacional en formato chat de Llama 3.1.
- Razonamiento y respuesta a preguntas sobre los hechos del split retain90 de TOFU-para.
- Respuesta a las parafrasis `para1` y `para2` de esos mismos hechos (capacidad buscada explicitamente por el diseno del dataset).
- Capacidades generales heredadas de Llama 3.1 8B Instruct: codigo, matematicas basicas, resumen y redaccion, en la medida en que el fine-tune no las degrade.
- Soporte de tool calling y function calling: heredado del modelo base, no verificado ni documentado para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: no documentadas; los idiomas figuran como no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Linea base de referencia en experimentos de unlearning: se usa como el modelo que "nunca vio" los hechos del forget10, de modo que cualquier metodo de desaprendizaje puede compararse contra el para medir si ha eliminado conocimiento real y no solo las muestras concretas.
- Evaluacion de forget quality en TOFU: al ser el modelo retain de referencia, permite calcular la distancia entre un modelo sometido a unlearning y el estado ideal en el que esos hechos jamas se aprendieron.
- Estudio de generalizacion del olvido a parafrasis: gracias a las cinco parafrasis de TOFU-para, sirve para comprobar si un metodo elimina el conocimiento o solo la formulacion literal vista durante el entrenamiento de olvido.
- Investigacion sobre privacidad y derecho al olvido: escenario controlado para medir si un modelo puede "desaprender" datos personales o factuales sin perder utilidad en el resto del conocimiento.
- Reproducibilidad de experimentos: la configuracion exacta en `train_config/` y la semilla fija (seed 2) permiten replicar el fine-tune y comparar resultados entre metodos de unlearning de forma justa.
- Analisis de degradacion por fine-tune: comparar este modelo con el Llama 3.1 8B Instruct original permite cuantificar cuanto cambia un modelo tras 5 epocas de ajuste sobre 10.800 filas, util para calibrar el coste de utilidad del unlearning.
- Docencia y divulgacion sobre unlearning: ejemplo reproducible y pequeno (8B, 10.800 filas) para explicar la diferencia entre untraining y unlearning en un curso o tutorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones estandar para un modelo denso de 8B, no verificadas en la card).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 y en RTX 3090/4080 (16-24 GB) con cuantizacion 8 bits o 4 bits.
- Opciones de despliegue: transformers (soporte nativo, tag `text-generation-inference` y `endpoints_compatible`), vLLM, TGI y llama.cpp/Ollama mediante conversion a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2 | 8.030.261.248 | no disponible (heredado de Llama 3.1) | Fine-tune de referencia retain90 para unlearning TOFU-para | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | Modelo base instructivo general | llama3.1 | Hugging Face, ampliamente usado |
| Otros modelos de la coleccion TOFU-para de sungjuncho | 8B (misma base) | no disponible | Variantes con otros splits, semillas o metodos de unlearning | llama3.1 | Hugging Face (coleccion `tofu-para-untraining-vs-unlearning`) |
| Modelos TOFU clasicos de `locuslab` | 8B y otros tamanos | no disponible | Baselines de unlearning sobre TOFU original | variable | Hugging Face / GitHub |

La comparacion relevante es contra el Llama 3.1 8B Instruct original (misma arquitectura y parametros, distinto fine-tune) y contra las demas variantes de la coleccion TOFU-para, que comparten base y difieren en split, semilla o metodo.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta disenado como referencia experimental de unlearning, no para despliegue en produccion.
- Riesgo de alucinacion: heredado de Llama 3.1 8B Instruct y potencialmente alterado por el fine-tune sobre datos sinteticos de TOFU; no se documenta evaluacion de factualidad.
- Sesgos conocidos: no documentados para este fine-tune; se heredan los del modelo base.
- Idiomas: no disponibles; el dataset TOFU es en ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la card no especifica la longitud de contexto efectiva tras el fine-tune; se asume la de Llama 3.1 (128.000 tokens), pero no esta verificado.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de atribucion de Meta; requiere aceptar los terminos y conservar el aviso "Built with Llama".
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la calidad del fine-tune.
- Uso en produccion: no recomendado por su naturaleza de artefacto de investigacion y por la ausencia de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Codigo de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de TOFU (referencia del dataset original): no disponible en la informacion proporcionada.
