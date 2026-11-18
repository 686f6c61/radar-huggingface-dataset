# SZLHOLDINGS/salad-khipu-scholar-v1

## Resumen

salad-khipu-scholar-v1 es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por SZL Holdings (un unico autor, Stephen Lutar) en el marco de su programa de investigacion sobre los khipu andinos. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto al modelo base para funcionar. Su proposito declarado es la experimentacion academica sobre literatura cientifica relativa a los khipu, no la produccion ni el descifrado.

El adaptador se entreno sobre el corpus khipu-scholars-corpus-v1, un dataset de acceso restringido a miembros, con un tope de 2.000 pasos y un tiempo de pared de 9,45 horas GPU. El autor documenta un loss final de 0,0085 y publica un recibo de finalizacion firmado con DSSE y ed25519 como evidencia canonica del entrenamiento, en lugar de resultados de evaluacion.

El interes de esta ficha es limitado para el publico general de desarrolladores: se trata de un artefacto de investigacion muy acotado, sin benchmarks publicados, sin datos de idiomas declarados y sin pretensiones de uso comercial. Su relevancia radica en el patron de trazabilidad (recibos firmados, hash del corpus) y en servir como ejemplo de adaptador LoRA de dominio especifico sobre un modelo pequeno de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA SFT (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (material academico sobre investigacion de khipu andinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El entrenamiento consistio en un SFT con LoRA mediante la libreria TRL, con un tope de 2.000 pasos y PEFT 0.21.3. No se documentan el rango del LoRA, el alpha, la tasa de aprendizaje ni la composicion detallada del dataset, salvo que se trata de material academico en ingles sobre khipu con doctrina de procedencia (los monografos con copyright se catalogan pero nunca se entrenan).

El autor no reporta uso de RLHF ni DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La innovacion declarada es de gobernanza de datos: un corpus con hash sha256 registrado (0a32769c...) y un recibo de finalizacion firmado criptograficamente que sella hardware, parametros y perdida final. El loss reportado (0,0085) es un dato de entrenamiento, no una medida de calidad.

## Capacidades

- Generacion de texto conversacional en ingles sobre tematica de investigacion de khipu andinos.
- Reproduccion del entrenamiento documentado (el autor lo presenta como artefacto reproducible).
- Carga estandar via PEFT: `PeftModel.from_pretrained` sobre Qwen3-1.7B.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no declaradas; el autor indica unicamente ingles academico.
- No se declaran capacidades de codigo ni matematicas mas alla de las heredadas del modelo base.

## Casos de uso

- Reproduccion de experimentos academicos: cargar el adaptador sobre Qwen3-1.7B para verificar el entrenamiento descrito y comparar con el modelo base en tareas de texto sobre khipu.
- Investigacion en humanidades digitales: generar borradores o resumenes de literatura secundaria sobre khipu para revision por expertos, nunca como interpretacion historica definitiva.
- Estudio de tecnicas de trazabilidad: usar el recibo DSSE y el hash del corpus como ejemplo de pipeline de procedencia de datos en proyectos de investigacion.
- Analisis de adaptadores de dominio: comparar el comportamiento del adaptador frente al modelo base en vocabulario especializado (terminologia andina, referencias bibliograficas).
- Docencia y formacion: emplear el modelo como caso practico de LoRA SFT con TRL en cursos de ajuste fino.
- Evaluacion de sesgos en corpus pequenos: estudiar como un corpus acotado y con doctrina de procedencia afecta a la generacion de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama ninguna evaluacion de benchmark para esta version; la evidencia canonica es el recibo de finalizacion firmado (loss final 0,0085, 2.000 pasos, 9,45 horas GPU).

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,2 GB (tamano del repositorio); requiere cargar ademas el modelo base Qwen3-1.7B.
- VRAM estimada para el modelo base en fp16: en torno a 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits cabria en GPUs consumer de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para inferencia; A100/H100 no son necesarias.
- Despliegue: transformers + PEFT es la via documentada; llama.cpp, Ollama o vLLM requeririan fusionar el adaptador con el modelo base y convertirlo, lo que no esta documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| salad-khipu-scholar-v1 | adaptador sobre 1,7 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Adaptador de dominio, sin benchmarks |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | Apache-2.0 | Hugging Face | Modelo generalista; el adaptador se evalua frente a el |
| Adaptadores LoRA de dominio genericos | variable | heredado del base | variable | Hugging Face | Categoria comparable; sin datos concretos en la informacion disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion exploratorio: el autor no reclama competencia mas alla del recibo de entrenamiento.
- Uso fuera de alcance declarado: cualquier afirmacion de descifrado de khipu, interpretacion historica o arqueologica sin validacion experta, y despliegue en produccion o comercial.
- Riesgo de alucinacion: no evaluado; un corpus pequeno y especializado no garantiza fidelidad factual.
- La etiqueta ALBA esta disputada segun la doctrina del corpus del propio autor.
- La senal reportada sobre estructuras aritmeticas de khipu es estadistica y exploratoria, no prueba de significado historico.
- Idiomas: solo ingles academico declarado; sin soporte multilingue documentado.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero el autor desaconseja explicitamente el despliegue en produccion.
- Sin benchmarks, sin evaluacion de sesgos y sin datos de cuantizacion: no apto para decisiones de produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-khipu-scholar-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio: https://github.com/szl-holdings/szl-khipu-scholar
- Demo relacionada (Khipu Proof Loom Space): https://huggingface.co/spaces/SZLHOLDINGS/khipu-proof-loom
- Recibos de entrenamiento (dataset): https://huggingface.co/datasets/SZLHOLDINGS/khipu-scholar-runs
- Perfil del autor: https://github.com/stephenlutar2-hash
