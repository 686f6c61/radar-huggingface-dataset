# zedgamer/ultimate-odycer-3d-assistant-lora

## Resumen

Ultimate Odycer 3D Assistant es un adaptador LoRA publicado por el usuario zedgamer sobre el modelo base ccore/Qwen3.5-4B-3D-Coder, un transformer de 4.000 millones de parametros orientado a generacion de codigo y contenido 3D. El adaptador especializa el modelo base en tres tareas concretas del proyecto Ultimate Odycer: traduccion de instrucciones en lenguaje natural a trazas urbanas estructuradas para el CityEditor, clasificacion morfologica de flora en PlantLab Studio y extraccion de estructura anatomica de criaturas para el Bestiaire.

El adaptador se entrena con QLoRA (rank 8, alpha 16, target all-linear) en BF16 sobre una GPU RTX 3060 de 12 GiB mediante LLaMAFactory, con un conjunto de 176 ejemplos unificados multi-dominio y validacion determinista. Su interes tecnico radica en el diseno explicito de abstencion: el modelo devuelve `recette_exacte: null` o `statut: invisible` cuando no puede inferir parametros no observables, en lugar de alucinar.

Se distribuye como pesos safetensors de aproximadamente 0,1 GB, con licencia Apache 2.0 y soporte declarado de frances e ingles. Es un adaptador de nicho, pensado para integrarse junto al guardarrail deterministico del CityEditor, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only (modelo base Qwen3.5-4B-3D-Coder) |
| Parametros totales | no disponible (adaptador LoRA de ~0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en QLoRA BF16 con lm_head nativa FP16; no se documentan cuantizaciones de inferencia |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rank / alpha LoRA | 8 / 16, target all-linear |
| Modelo base | ccore/Qwen3.5-4B-3D-Coder |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only de 4.000 millones de parametros (Qwen3.5-4B-3D-Coder). El fine-tuning emplea QLoRA con rank 8, alpha 16 y target `all-linear`, en precision BF16, manteniendo la cabeza `lm_head` en FP16 nativa. El entrenamiento se ejecuto en un servidor local EurekAI con una RTX 3060 de 12 GiB usando LLaMAFactory y el optimizador Paged AdamW de 8 bits, con batch size 1 y acumulacion de gradiente.

El conjunto de datos consta de 176 ejemplos unificados multi-dominio, con controles anti-duplicado, validacion determinista y conjuntos de test separados. Cada paso de optimizacion se valido comprobando que los gradientes fueran estrictamente finitos y no nulos. No se documenta el numero de tokens de entrenamiento ni la composicion detallada del dataset, mas alla de la mencion a los tres dominios (CityEditor, PlantLab, Bestiaire). Tampoco se especifica si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en frances e ingles para asistencia dentro de herramientas de edicion.
- Traduccion de instrucciones en lenguaje natural (por ejemplo, "relie (4,2) a (6,2) en terre avec une porte au milieu") a listas ordenadas de celdas 2D metricas con campos `x`, `z`, `is_gate` y `material`.
- Generacion de estructuras compatibles con el compilador deterministico y el renderizado 3D en tiempo real del CityEditor (Three.js / Godot).
- Clasificacion morfologica de flora a partir de capturas multi-angulo (arbol frondoso, conifera, arbusto, etc.).
- Abstencion estricta: devuelve `recette_exacte: null` cuando los parametros geneticos o la semilla no son observables, y `statut: invisible` ante oclusion o imagen no explotable.
- Extraccion de estructura anatomica anonimizada de criaturas (cuerpo segmentado, pinzas, patas, aguijon) con especificacion visual estricta.
- Restriccion explicita de atributos no presentes, como `has_roof: false` en criaturas.
- No se documenta soporte de tool calling generico, agentes multi-paso, vision nativa ni modo thinking; las capacidades visuales descritas son de clasificacion sobre capturas, no vision multimodal confirmada en la model card.

## Casos de uso

- Edicion urbana asistida por lenguaje natural: el creador describe una calle, una puerta o un material en frances y el adaptador devuelve la lista de celdas metricas que el compilador deterministico del CityEditor convierte en geometria 3D. Es adecuado porque el formato de salida esta fijado y validado por el guardarrail `city-assistant-domain.mjs`.
- Generacion procedural de trazados verificables: integrado en un pipeline que valida cada celda antes de renderizar, permite iterar sobre disenos urbanos sin riesgo de escenas corruptas.
- Catalogacion de flora en PlantLab Studio: a partir de fotos multi-angulo, el modelo asigna categoria morfologica y marca como invisible lo que no puede analizar, lo que reduce falsos positivos en inventarios botanicos.
- Documentacion de bestiario: extrae la anatomia de una criatura para generar fichas estructuradas y consistentes, evitando atribuir elementos arquitectonicos inexistentes.
- Prototipado rapido en estudios independientes: al ser un adaptador de 0,1 GB sobre un base de 4B, puede desplegarse en estaciones de trabajo modestas junto al motor del juego.
- Asistencia interna en herramientas de autoria: el modelo actua como capa de traduccion entre la intencion del disenador y los formatos de datos del motor, con abstención controlada cuando la peticion es ambigua.
- Pruebas de regresion de prompts: el comportamiento de abstencion documentado permite construir tests deterministas que verifiquen que el modelo no inventa parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB; el modelo base de 4B requiere VRAM adicional para inferencia.
- Entrenamiento realizado en una RTX 3060 de 12 GiB, lo que indica que el fine-tuning QLoRA cabe en GPU de consumo.
- Para inferencia en BF16 del base de 4B se estiman del orden de 8-10 GB de VRAM; con cuantizacion de 4 bits podria reducirse a unos 3-4 GB, aunque el autor no documenta cuantizaciones de inferencia.
- GPU recomendadas: RTX 3060 12 GiB o superior para el base en BF16; A100 o H100 no son necesarias para este tamano.
- Despliegue mediante Transformers + PEFT segun el ejemplo de la model card; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ultimate Odycer 3D Assistant (LoRA) | base 4B + adaptador | no disponible | Apache 2.0 | Asistencia 3D procedural para Ultimate Odycer |
| ccore/Qwen3.5-4B-3D-Coder (base) | 4B | no disponible | no disponible | Generacion de codigo y contenido 3D |
| Qwen3.5-4B generico | 4B | no disponible | no disponible | Proposito general |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 176 ejemplos, lo que limita su generalizacion fuera de los tres dominios previstos.
- Soporte declarado unicamente de frances e ingles; el rendimiento en castellano no esta documentado.
- Disenado para funcionar junto al guardarrail deterministico del CityEditor; usarlo sin esa validacion externa elimina la garantia de integridad de escenas.
- Riesgo de alucinacion mitigado por el diseno de abstencion, pero no eliminado: el modelo podria producir estructuras plausibles fuera de distribucion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 del adaptador no cubre necesariamente las condiciones del modelo base; conviene verificar la licencia de ccore/Qwen3.5-4B-3D-Coder antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- No se documenta la longitud de contexto efectiva del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/zedgamer/ultimate-odycer-3d-assistant-lora
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Sitio del proyecto: https://www.ultimateodycer.com/
- Canal de YouTube: https://www.youtube.com/channel/UCIWC2OAc69P61TPtdNKnYFg
