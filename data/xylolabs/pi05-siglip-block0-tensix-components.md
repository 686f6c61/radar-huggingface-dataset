# Xylolabs/pi05-SigLIP-Block0-Tensix-Components

## Resumen

Este repositorio no contiene un modelo completo, sino un componente aislado del modelo de robótica pi0.5 de LeRobot: concretamente el primer bloque del codificador de visión SigLIP, extraído y serializado en tensores portables por Xylolabs. El objetivo es facilitar la integración de esa pieza concreta en el hardware Tensix de Tenstorrent, de modo que quien esté portando pi0.5 a aceleradores Tenstorrent pueda cargar y validar el bloque de visión de forma independiente, sin necesidad de descargar ni manipular el checkpoint completo de la política.

El artefacto conserva los valores originales en FP32 y fusiona sin pérdida las proyecciones QKV en un único tensor concatenado, lo que simplifica la carga en operadores de bajo nivel. No incluye el resto de bloques de visión, ni el modelo de lenguaje/acción, ni una política ejecutable: es únicamente un ladrillo del pipeline. Por tanto, no es un modelo que se pueda usar para inferencia directa, sino material de referencia para desarrolladores que implementan o validan kernels y capas sobre Tensix.

La relevancia es acotada pero clara en el nicho de robótica y compiladores de hardware: pi0.5 es una política visión-lenguaje-acción (VLA) basada en PaliGemma, y disponer de sus componentes en formatos verificables con hash y especificación de formas/dtypes ayuda a reproducir el grafo y a comprobar la equivalencia numérica al portarlo a nuevas plataformas. La licencia heredada es Gemma Terms of Use, con las restricciones de uso de la sección 3.2 incorporadas como condiciones vinculantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bloque de vision transformer SigLIP (componente de pi0.5), con QKV fusionado |
| Parámetros totales | no disponible (el repositorio contiene 12 tensores de un solo bloque; el modelo base pi0.5 no se especifica aquí) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los tensores se distribuyen en FP32 |
| Idiomas soportados | en |
| Licencia | Gemma Terms of Use (con Prohibited Use Policy); se conservan términos Apache 2.0 heredados del backbone |
| Formato de pesos | safetensors (FP32), con `component.json` que declara formas, dtypes y hashes; almacenamiento aproximado de 61 MB |

## Arquitectura y entrenamiento

El componente corresponde al primer bloque del codificador SigLIP usado dentro de pi0.5 (LeRobot). Según la model card, la arquitectura del bloque requiere: anchura oculta de 1152, 16 cabezas de atención, anchura de MLP de 4304, activación GELU con aproximación tanh y LayerNorm con epsilon 1e-6. Las proyecciones y sesgos de Q, K y V se han concatenado en el orden Q, K, V sin redondeo, preservando los valores FP32; el resto de parámetros mantienen sus valores y dtypes originales. En total son doce tensores.

No se describe en la información disponible ningún proceso de entrenamiento propio: el artefacto es una extracción y reserialización de pesos ya entrenados del modelo base `lerobot/pi05_base`. La model card indica que la evaluación realizada cubre la extracción y serialización (coincidencia exacta de los doce tensores con sus parámetros de origen o con la concatenación QKV declarada, y comprobación de que todos los valores son finitos, además de la coincidencia de identidad LFS del safetensors original), pero no la calidad de salida de un bloque integrado ni de la política. No se reportan datos sobre tokens de entrenamiento, composición del dataset ni técnicas de RLHF/DPO.

## Capacidades

- No es un modelo autónomo: no genera texto, no razona, no ejecuta código ni realiza inferencia por sí mismo.
- Proporciona los pesos de un bloque de visión (atención + MLP) listos para integrarse en una implementación de SigLIP compatible con la arquitectura descrita.
- Facilita la validación numérica de portes a hardware Tensix mediante hashes, formas y dtypes declarados en `component.json`.
- Incluye un cargador de ejemplo (`load_components.py`) que verifica hashes, nombres, formas, dtypes y finitud de valores.
- Soporte de tool calling, agentes, multilingüismo, visión de extremo a extremo o modo de razonamiento: no aplica a este artefacto.
- El componente pertenece a un sistema VLA (visión-lenguaje-acción) orientado a robótica, pero las capacidades de ese sistema no se pueden ejercer con este repositorio aislado.

## Casos de uso

- Porte de pi0.5 a Tenstorrent: usar el bloque como unidad de prueba para implementar y validar las capas de atención y MLP de SigLIP en Tensix antes de abordar el modelo completo.
- Verificación de kernels: comparar la salida de un kernel propio (por ejemplo, atención fusionada QKV) contra los tensores FP32 de referencia para detectar desviaciones numéricas.
- Desarrollo de cargadores en streaming: reutilizar el patrón de `load_components.py` para cargar selectivamente componentes de un checkpoint grande sin descargar todo el repositorio.
- Integración en pipelines de robótica: servir como pieza de un grafo mayor cuando se reconstruya la política pi0.5 sobre una plataforma alternativa, siempre que se disponga del resto de bloques y del modelo de lenguaje/acción.
- Auditoría de licencias y procedencia: el repositorio incluye términos Gemma completos, aviso obligatorio y referencia al origen fijado, útil para equipos que necesitan documentar el cumplimiento antes de distribuir derivados.
- Docencia e investigación en compiladores de ML: ejemplo compacto (61 MB) de cómo empaquetar un bloque de transformer con metadatos verificables para experimentos de compilación y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta velocidad y que las comprobaciones realizadas califican únicamente la extracción y serialización, no el rendimiento de un bloque integrado ni de la política.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,06 GB solo para los pesos del componente, más espacio para búferes de trabajo (cifra indicada por el autor para memoria de dispositivo).
- Almacenamiento: unos 61 MB en disco; el repositorio completo ocupa aproximadamente 0,1 GB.
- GPU recomendadas: no se especifican; al ser un componente FP32 de pequeño tamaño, cualquier GPU con al menos unos cientos de MB libres puede alojarlo.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del bloque.
- Opciones de despliegue: el ejemplo oficial usa PyTorch, safetensors y `huggingface_hub` con un cargador en streaming; el destino declarado es hardware Tenstorrent Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un componente de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/pi05-SigLIP-Block0-Tensix-Components | Componente de un bloque SigLIP de pi0.5 | no disponible (12 tensores, ~61 MB) | no disponible | Gemma Terms of Use | Hugging Face |
| lerobot/pi05_base | Política VLA completa (modelo base) | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| google/paligemma-3b-pt-224 | Modelo visión-lenguaje base de PaliGemma | 3B (según el nombre del repositorio) | no disponible en la información | no disponible en la información | Hugging Face |

La comparación directa no es posible en términos de rendimiento porque este repositorio no es un modelo evaluable de forma independiente; los otros dos se incluyen como referencia de procedencia (modelo base y backbone citado por el autor).

## Limitaciones y advertencias

- No es ejecutable por sí solo: requiere la arquitectura original de SigLIP y el resto de componentes (bloques de visión posteriores, modelo de lenguaje/acción y política) para producir una salida útil.
- Solo contiene el primer bloque de visión; cualquier uso que asuma un codificador completo o una política funcional es incorrecto.
- Los valores están en FP32, lo que limita su uso directo en despliegues que requieran cuantización; no se ofrecen variantes cuantizadas.
- La licencia Gemma Terms of Use incorpora restricciones de uso de la sección 3.2 como condiciones vinculantes para el uso y la distribución; es necesario revisarlas antes de cualquier uso comercial o redistribución.
- No se han publicado evaluaciones de calidad de salida del bloque integrado ni de la política; las comprobaciones documentadas cubren solo integridad de extracción y serialización.
- No hay datos sobre sesgos, alucinación o comportamiento multilingüe de este artefacto, ya que no genera contenido.
- Idioma declarado: inglés; no se documenta soporte de otros idiomas.
- El autor advierte que el material se proporciona tal cual, sin garantía.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tensix-Components
- Modelo base pi0.5: https://huggingface.co/lerobot/pi05_base
- Paper de pi0.5: https://huggingface.co/papers/2504.16054
- PaliGemma (backbone citado): https://huggingface.co/google/paligemma-3b-pt-224
- Cargador de ejemplo: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/pi05-SigLIP-Block0-Tensix-Components/blob/main/LICENSE
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio de código de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
