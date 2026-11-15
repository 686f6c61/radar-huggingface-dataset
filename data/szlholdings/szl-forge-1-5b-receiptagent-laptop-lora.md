# SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent-laptop-lora

## Resumen

SZL-Forge-1.5B-ReceiptAgent-laptop-lora es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent-laptop-lora`. Por el nombre y las etiquetas del repositorio, se trata de un adaptador LoRA orientado a un modelo base de aproximadamente 1.500 millones de parámetros, concebido para tareas de agente sobre recibos (*receipt agent*) en un entorno de portátil. Sin embargo, la model card no documenta el modelo base, la arquitectura, el dataset de entrenamiento ni los hiperparámetros utilizados, por lo que la mayor parte de las especificaciones técnicas no están disponibles.

El repositorio se describe explícitamente como un «artefacto de registro privado» del *estate* de SZLHOLDINGS, con etiquetas `research-artifact`, `experimental` y `private-estate`. La propia model card indica que, en la revisión observada, se retiraron las afirmaciones de la versión anterior (tabla de entrenamiento QLoRA, *model-index* de una batería de honestidad y distintivos de *receipts*) porque no existía evidencia verificable por modelo. El único dato medido que se conserva es una batería de sondas de gobernanza (6 sondas) que reporta 0 abstenciones o rechazos, ejecutada sobre una RTX 4090, y que el autor califica explícitamente como «no un benchmark».

Su relevancia actual es, por tanto, limitada y de carácter metodológico: ilustra una práctica de publicación que prioriza el fallo cerrado (*fail-closed*) y la trazabilidad de recibos criptográficos (SHA-256) sobre las afirmaciones de rendimiento. Para un desarrollador o investigador que necesite evaluar un modelo listo para producción, este artefacto no ofrece garantías de calidad, capacidades ni equivalencia de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; modelo base no documentado) |
| Parámetros totales | no disponible (el nombre sugiere un base de ~1,5B, sin confirmar) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la card menciona QLoRA en la versión retirada, sin detalle verificable) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según etiquetas del repositorio) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura del modelo base ni sobre la del adaptador. El nombre del repositorio sugiere un ajuste LoRA sobre un transformer de aproximadamente 1.500 millones de parámetros, y la versión anterior de la model card mencionaba una tabla de entrenamiento QLoRA, pero esa información fue retirada explícitamente por el autor al no poder verificarse por modelo. La model card actual declara: «No training contract, hyperparameter table, or dataset claim is made here», es decir, no se afirma ningún contrato de entrenamiento, tabla de hiperparámetros ni composición de dataset.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. El único elemento técnico verificable es el mecanismo de evidencia: la card referencia una revisión concreta del Hub (`7baaa290d0609a53fed06aeea84eda1bd31e5d56`) y un recibo JSON con SHA-256 (`6ba3f92958c37ca9c3fc32467af44b4536d06ba39b385130cb7a636505749aa4`) alojado en el dataset `SZLHOLDINGS/frontier-54-runs`. Ese recibo corresponde a una batería de sondas de gobernanza, no a una evaluación de capacidades.

## Capacidades

- Generación de texto: no confirmada por evidencia publicada.
- Razonamiento, código y matemáticas: no disponible.
- Visión: no disponible.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: el nombre del repositorio sugiere un uso como agente sobre recibos, pero no hay evidencia verificable de dicha capacidad.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, audio, etc.): no disponible.
- Comportamiento en sondas de gobernanza: la batería de 6 sondas reporta 0 abstenciones o rechazos (`abstained_or_refused 0 of 6`), ejecutada en una RTX 4090 con energía medida de 0,0 julios. El autor aclara que este resultado no constituye un benchmark ni una medida de calidad.

## Casos de uso

- Auditoría de artefactos de investigación: usar el repositorio como ejemplo de publicación *fail-closed*, revisando la trazabilidad entre revisión del Hub, recibo JSON y hash SHA-256 para reproducir el proceso de verificación documental. Es adecuado porque el propio artefacto está diseñado en torno a esa cadena de evidencia.
- Estudio de metodologías de gobernanza de modelos: analizar la batería de sondas de abstinencia/rechazo como plantilla para diseñar evaluaciones de comportamiento en lugar de evaluaciones de capacidad.
- Reproducción de recibos en pipelines internos: integrar el recibo del dataset `frontier-54-runs` en un sistema de CI que valide hashes antes de promover artefactos entre entornos.
- Docencia sobre model cards: emplear la diferencia entre la versión estampada (retirada) y la versión actual como caso práctico de por qué no deben publicarse afirmaciones sin evidencia por modelo.
- Investigación sobre adaptadores LoRA de dominio específico: si se dispone del modelo base (no documentado aquí), el adaptador podría inspeccionarse para estudiar técnicas de ajuste eficiente en tareas de extracción de datos de recibos, aunque sin garantías de calidad.
- Evaluación comparativa de prácticas de publicación: contrastar este repositorio con artefactos que sí publican benchmarks y contratos de entrenamiento para estudiar el impacto de la transparencia en la adopción (32 descargas, 0 *likes* en la fecha de consulta).

No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea que requiera garantías de rendimiento, dado que no existe evidencia publicada al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente: «No evaluation, benchmark, or battery result is claimed for this artifact» y «No benchmark recorded». El único resultado medido es la batería de gobernanza:

| Prueba | Resultado | Contexto |
|---|---|---|
| Batería de gobernanza (estate-battery) | 0 de 6 sondas con abstención o rechazo | RTX 4090, rerun con pip fijado, 2026-11-15, energía medida 0,0 J |
| Benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si el base es de ~1,5B parámetros, una estimación orientativa en fp16 sería de ~3 GB de pesos más overhead de contexto y activaciones, y en cuantización de 4 bits de ~1 GB; sin embargo, estas cifras son inferencias del nombre del repositorio y no están confirmadas por el autor.
- GPU recomendadas: no disponible. La única GPU mencionada es una NVIDIA GeForce RTX 4090, usada para ejecutar la batería de gobernanza, no para inferencia de producción.
- Compatibilidad con GPU de consumo: no confirmada; el sufijo `laptop` del nombre sugiere un objetivo de portátil, pero no hay especificación técnica que lo respalde.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. Al ser un adaptador LoRA en safetensors, requeriría cargarse junto con su modelo base, que no se identifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y el autor no establece comparaciones con otros artefactos. La categoría del repositorio (artefacto de investigación privado con licencia Apache 2.0 y sin benchmarks) no permite una comparación técnica significativa con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Ausencia total de evidencia de capacidades: no hay benchmarks, evaluaciones ni contrato de entrenamiento verificable; cualquier uso en producción carece de base técnica.
- Modelo base no identificado: al ser un adaptador LoRA, no puede desplegarse sin conocer y cargar el modelo base correspondiente, que la card no especifica.
- Afirmaciones retiradas: la versión anterior de la card incluía un *model-index*, una tabla QLoRA y distintivos de *receipts* que el autor eliminó por no poder verificarse por modelo; conviene no tomar esos datos del historial de revisiones como válidos.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia no sustituye la falta de garantías técnicas; el autor no ofrece ninguna.
- Visibilidad y estado: el repositorio se describe como «private registry artifact» del *estate* de SZLHOLDINGS, con etiquetas `experimental` y `research-artifact`; no debe tratarse como un artefacto cualificado para producción.
- Resultado de gobernanza mal interpretable: el «0 de 6» indica ausencia de abstenciones/rechazos en sondas de gobernanza, no un rendimiento positivo; el autor lo califica expresamente como «not a benchmark».
- Madurez: 32 descargas y 0 *likes* en la fecha de consulta, lo que refleja una adopción prácticamente nula y ausencia de validación por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent-laptop-lora
- Recibo de la batería de gobernanza (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-szl_forge_1_5b_receiptagent_laptop_lora.json
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Revisión observada citada en la card: `7baaa290d0609a53fed06aeea84eda1bd31e5d56`
- Paper, blog, repositorio de código o demo: no disponible
