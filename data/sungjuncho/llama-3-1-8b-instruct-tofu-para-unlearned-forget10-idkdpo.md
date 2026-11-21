# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo

## Resumen
Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo IdkDPO, implementado en el framework open-unlearning. Lo desarrolla el usuario de Hugging Face sungjuncho como parte de la colección TOFU-para, un esfuerzo de investigación que separa conceptualmente el *untraining* (eliminar las muestras exactas que el método recibió) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El problema que aborda es la eliminación fiable de conocimiento factual concreto de un modelo de lenguaje sin degradar sus capacidades generales.

El punto de partida es un Llama-3.1-8B-Instruct afinado sobre el dataset TOFU completo más dos versiones parafraseadas; sobre ese modelo se aplica IdkDPO con el conjunto de olvido forget10 original (400 pares QA) y un conjunto de retención de 10.800 ejemplos (retain90 más dos paráfrasis). La relevancia radica en que el autor publica métricas de evaluación específicas (FADE, calidad de olvido TOFU, utilidad del modelo) y las replica en tres semillas, algo poco habitual en modelos de desaprendizaje, lo que permite evaluar la estabilidad del método.

Arquitectónicamente es un transformer decoder-only estándar de Meta con 8.030.261.248 parámetros, sin modificaciones estructurales: el interés está en el proceso de entrenamiento posterior, no en la arquitectura. El contexto, los idiomas y el resto de especificaciones heredan los de Llama-3.1-8B-Instruct, aunque la model card no los detalla explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), sin modificaciones estructurales |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (heredada de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF no publicada) |
| Idiomas soportados | no disponible en la model card (heredados de Llama-3.1-8B-Instruct) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers, dtype bfloat16 recomendado) |

## Arquitectura y entrenamiento
La arquitectura es la de Llama-3.1-8B-Instruct sin cambios: un transformer decoder-only denso de 8.000 millones de parámetros. La innovación no reside en la arquitectura sino en la fase de alineación posterior. El modelo base (`sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) se obtuvo afinando Llama-3.1-8B-Instruct sobre el dataset TOFU-para, que es TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA. Sobre ese modelo se aplica IdkDPO del repositorio open-unlearning con los hiperparámetros por defecto de la librería, sin recorte de gradiente (*no gradient clipping*), batch efectivo de 32 y semilla 0. El conjunto de olvido son los 400 pares QA de forget10 originales; el conjunto de retención son 10.800 ejemplos (retain90 más las paráfrasis para1 y para2). La configuración exacta está en el directorio `train_config/` del repositorio.

La evaluación separa dos tareas: *untraining* (comparar contra un modelo de referencia afinado solo con retain90 + forget10 parafraseado, es decir, que nunca vio el forget10 original) y *unlearning* (comparar contra el modelo de referencia afinado solo con retain90, que no vio ninguna versión del conocimiento a olvidar). La métrica FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos.

## Capacidades
- Generación de texto conversacional: hereda la capacidad de instrucción de Llama-3.1-8B-Instruct, con formato de chat y rol de asistente.
- Razonamiento y conocimiento general: el modelo parte de un checkpoint con las capacidades de Llama-3.1-8B-Instruct, aunque la utilidad medida tras el desaprendizaje es de 0,346 en la escala TOFU (frente a valores superiores en modelos de referencia), lo que indica cierta degradación.
- Conocimiento factual limitado deliberadamente: el objetivo del modelo es que no responda correctamente sobre el conjunto forget10; su comportamiento esperado ante esas preguntas es una respuesta de "no lo sé" o una respuesta degradada.
- Tool calling y function calling: no documentado en la model card; se heredaría del modelo base Llama-3.1-8B-Instruct, pero no hay verificación publicada.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en la model card.
- Capacidades multilingües: no documentadas en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso
- Investigación en desaprendizaje de máquinas: sirve como checkpoint de referencia para reproducir y comparar el algoritmo IdkDPO frente a otros métodos (gradient ascent, NPO, etc.) sobre el mismo modelo base y el mismo conjunto forget10, gracias a que el autor publica configuraciones y métricas por semilla.
- Evaluación de la estabilidad de métodos de unlearning: al estar replicado en tres semillas con FADE, probabilidad Q-A, ROUGE y truth ratio, permite estudiar la varianza del método (por ejemplo, la utilidad varía de 0,214 a 0,486 entre semillas) y no solo su valor medio.
- Estudio de la distinción entre untraining y unlearning: el modelo está diseñado para que se pueda medir por separado si elimina las muestras exactas o el conocimiento subyacente, usando las dos tareas FADE y las paráfrasis para1/para2.
- Auditoría de privacidad y eliminación de datos: escenario de cumplimiento en el que se necesita eliminar información personal o factual concreta de un modelo ya entrenado; este checkpoint ejemplifica el flujo completo con métricas cuantitativas de olvido.
- Docencia y formación técnica: útil para demostrar en un curso o tutorial cómo se mide el desaprendizaje con TOFU y FADE, y por qué una métrica de olvido alta puede convivir con una pérdida de utilidad.
- Baseline en pipelines de investigación: punto de comparación para nuevos métodos de unlearning que se evalúen sobre Llama-3.1-8B con el dataset TOFU-para, evitando reentrenar el modelo de partida.

## Benchmarks y rendimiento

| Metrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs referencia retain90-forget10para) | 72,39 | 72,6 ± 2,5 |
| FADE, unlearning (vs referencia retain90) | 89,44 (original 86,4 / para1 91,2 / para2 90,7) | 92,1 ± 2,6 |
| Calidad de olvido TOFU (p-valor vs referencia retain90) | 3,02e-28 | no disponible |
| Truth ratio del conjunto forget | 0,452 | 0,447 ± 0,006 |
| Probabilidad Q-A del conjunto forget | 0,702 | 0,704 ± 0,003 |
| ROUGE Q-A del conjunto forget | 0,063 | 0,092 ± 0,038 |
| Utilidad del modelo | 0,346 | 0,349 ± 0,136 |

Puntos de referencia FADE publicados por el autor: el "perfect untrainer" (`x2-retain90-forget10para`, otra semilla) obtiene 21,4 ± 0,3 en untraining y 136,7 ± 0,4 en unlearning; el "perfect unlearner" (`x2-retain90`, otra semilla) obtiene 104,2 ± 0,3 en untraining y 29,8 ± 0,3 en unlearning; el modelo sin desaprendizaje (`x2-full`, semillas 0-2) obtiene 81,6 ± 0,7 y 156,3 ± 0,2. El modelo aquí descrito queda en 72,4 y 89,4, es decir, más cerca del untrainer que del unlearner en la tarea de untraining, pero lejos del ideal en la de unlearning.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica se recomienda una GPU de 24 GB o más para contexto largo.
- Cuantización: no se publican pesos GGUF ni cuantizados en el repositorio; habría que generarlos a partir de los safetensors. En 8 bits cabría en GPUs de 16 GB; en 4 bits, en torno a 6-8 GB de pesos, aunque la calidad tras el desaprendizaje podría degradarse de forma no medida.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado. En GPUs consumer de 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), text-generation-inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IdkDPO, seed 0) | 8,03 B | no disponible | Unlearning IdkDPO sobre TOFU-para | llama3.1 | Hugging Face, 910 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (modelo de partida) | 8,03 B | no disponible | Afinado completo sin desaprender | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (referencia "perfect unlearner") | 8,03 B | no disponible | Afinado solo con retain90 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (referencia "perfect untrainer") | 8,03 B | no disponible | Afinado sin el forget10 original | llama3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para: los tres modelos de referencia comparten arquitectura, licencia y tamaño, y difieren solo en los datos de entrenamiento, lo que aísla el efecto del desaprendizaje. Frente a métodos alternativos de unlearning (gradient ascent, NPO, RMU) no hay comparación publicada en la información disponible.

## Limitaciones y advertencias
- El modelo no elimina por completo el conocimiento objetivo: en la tarea de unlearning su FADE es 89,44 frente al ideal de 29,8, y su utilidad cae a 0,346, lo que indica que el desaprendizaje es parcial y con coste en capacidades generales.
- Alta varianza entre semillas en la utilidad del modelo (0,214 a 0,486), lo que hace arriesgado usar un único checkpoint como representativo del método.
- La probabilidad Q-A del conjunto forget sigue siendo 0,702 y el truth ratio 0,452, valores que sugieren que el modelo aún puede generar respuestas relacionadas con el contenido supuestamente olvidado; no debe tratarse como garantía de eliminación de información sensible.
- Riesgo de alucinación: no evaluado específicamente; el proceso de desaprendizaje puede aumentar respuestas evasivas o incorrectas sobre el dominio forget10.
- Sesgos: no documentados; se heredan los del modelo base Llama-3.1-8B-Instruct, sin evaluación adicional en esta model card.
- Idiomas y longitud de contexto no especificados en la model card; no deben asumirse sin verificar contra el modelo base.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y de redistribución según los términos de Meta; requiere aceptar la licencia y cumplir la política de uso aceptable.
- Es un artefacto de investigación, no un modelo listo para producción: la model card no documenta evaluación de seguridad, sesgos ni robustez adversarial.
- El nombre del repositorio en el ejemplo de código de la model card (`...-idkdpo-seed0`) no coincide exactamente con el ID del repositorio (`...-idkdpo`); conviene verificar la ruta antes de cargarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo
- Modelo base (punto de partida): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (implementación de IdkDPO): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio como `LICENSE`
