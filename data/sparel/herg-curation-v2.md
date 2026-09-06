# sparel/herg-curation-v2

## Resumen

El modelo `sparel/herg-curation-v2` es un adaptador PEFT LoRA (rank 16, alpha 32, dropout 0.05) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Lo desarrolla Serge Parel (usuario `sparel`) con el objetivo de convertir registros crudos de ensayos y actividad sobre el canal de potasio hERG/KCNH2 (objetivo ChEMBL CHEMBL240) en tarjetas de evidencia JSON planas y estructuradas. No se trata de un modelo de lenguaje completo, sino de un adaptador que añade unos 0.1 GB de pesos entrenables al modelo base.

El problema que resuelve es la automatización de la fase de curación de datos en flujos de quimiinformática: cuando se construyen datasets para modelos QSAR de cardiotoxicidad, es habitual disponer de registros heterogéneos en ChEMBL con campos arbitrarios, unidades inconsistentes o comentarios de validez. Este adaptador extrae de forma estructurada esos campos y aplica una regla determinista de admisión para decidir si un registro es utilizable en un dataset QSAR.

Su relevancia radica en que reduce el coste de la revisión manual de registros hERG, al tiempo que mantiene un contrato de seguridad explícito: la salida del modelo no es una decisión científica final, sino una propuesta que debe validarse con reglas deterministas. La librería asociada es PEFT (0.20.0), y el formato de pesos es un adaptador safetensors compatible con la revisión fijada `a09a35458c702b33eeacc393d103063234e8bc28` del modelo base. El contexto y tokenizer se heredan de Qwen2.5-7B-Instruct; el adaptador no añade tokens propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5-7B-Instruct + adaptador PEFT LoRA |
| Parametros totales | No disponible (el modelo base tiene 7B; el adaptador ocupa 0.1 GB en disco) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base Qwen2.5-7B-Instruct (32 768 tokens segun documentacion de Qwen) |
| Tipos de cuantizacion | No especificados; al ser un adaptador PEFT, puede combinarse con cuantizacion 4-bit del base (QLoRA) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que no modifica los pesos del base. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de Qwen2.5-7B-Instruct. Con rank 16, alpha 32 y dropout 0.05, el adaptador se entrena mediante QLoRA, lo que permite ajustar el modelo con un consumo de VRAM moderado. La version de PEFT usada es 0.20.0 y no se incluyen tokens nuevos en el tokenizer.

El entrenamiento se realizo sobre registros publicos de ChEMBL 37 para hERG/KCNH2 (objetivo CHEMBL240). La captura web se realizo el 2026-07-30. El README aporta SHA-256 de los ficheros fuente de actividades, ensayos y target, pero no publica el dataset de entrenamiento en si: el adaptador no incluye registros crudos ni salidas generadas.

La innovacion tecnica mas destacable no es un cambio de arquitectura, sino el diseno de un contrato de admision determinista que debe ejecutarse fuera del modelo. Dicho contrato establece que un registro es utilizable para QSAR solo si el endpoint es IC50, la relacion es igual (`=`), el valor es numerico y positivo, las unidades estan en `nM` o `uM`, no existe flag de `data_validity_comment` y el SMILES canonico no esta vacio. El modelo propone valores para `qsar_usable` y `exclude_reason`, pero el README insiste en recalcular la decision final con reglas programaticas.

## Capacidades

- Generacion de objetos JSON planos a partir de registros de ensayos hERG/HCN2, siguiendo un esquema fijo (`assay_type`, `target_name`, `target_id`, `target_confidence`, `organism`, `cell_line`, `endpoint`, `relation`, `value`, `units`, `qsar_usable`, `exclude_reason`, `curation_notes`).
- Extraccion de campos de actividad y ensayo (tipo de ensayo, estandar de valor, relacion, unidades, comentarios, SMILES canonico) mediante el protocolo de entrada de un campo por linea.
- Evaluacion heuristica de elegibilidad QSAR a partir de los campos extraidos, con generacion de motivos de exclusion en una lista de strings.
- No soporta tool calling, function calling ni razonamiento multi-paso en sentido de agente; es un modelo de extraccion estructurada.
- Capacidad multilingue reducida: el adaptador fue entrenado con registros y prompts en ingles; aunque el base es multilingue, la salida esperada es JSON y no se garantiza calidad en otros idiomas.
- No incluye capacidades de vision, audio ni modo de razonamiento explicito (no es un modelo tipo o1 o reasoning).

## Casos de uso

- Curation de registros hERG en pipelines de quimiinformatica: el adaptador se carga sobre Qwen2.5-7B-Instruct y recibe registros de ChEMBL en el orden de campos definido. Se puede integrar en scripts de Python con `peft` y `transformers` para transformar miles de filas CSV en tarjetas JSON revisables.
- Preparacion de datasets QSAR de cardiotoxicidad: se usa para filtrar y normalizar registros de inhibicion de hERG antes de entrenar modelos de prediccion de potencia. El determinismo del contrato evita que registros ambiguos entren por error en el dataset.
- Revision automatizada de ensayos en repositorios toxicológicos: el modelo genera una primera version de ficha de evidencia para que un farmacologo revise solo los casos señalados como ambiguos o no usables, en lugar de revisar todos los registros.
- Integracion en notebooks de curacion de datos, como los que aparecen en repositorios tipo MultiEndpointTox: el adaptador puede complementar pipelines que ya gestionan objetivos toxicológicos como hERG, proporcionando un paso de extraccion estructurada de datos crudos.
- Auditoria documental para estudios no clinicos: las tarjetas JSON generadas pueden almacenarse como evidencia de la provenance de los datos usados en modelos QSAR, incluyendo identificadores de objetivo y notas de curacion.
- Documentacion de conjuntos de datos para modelos toxicológicos: el adaptador produce de forma consistente el campo `exclude_reason`, lo que permite generar reportes de por que un registro fue descartado, util para trazabilidad en publicaciones cientificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen evaluaciones formales de calidad de extraccion, exactitud en el esquema JSON ni comparativas con otros modelos de curacion. La model card no aporta metricas de MMLU, HumanEval, GSM8K ni ninguna tarea generica.

## Requisitos de hardware

- El adaptador ocupa 0.1 GB, por lo que el requisito principal lo determina el modelo base Qwen2.5-7B-Instruct. No se han publicado requisitos oficiales en la model card.
- Para ejecutar el adaptador en FP16, se necesitan aproximadamente 14-16 GB de VRAM. Con cuantizacion 4-bit del base (por ejemplo, mediante `bitsandbytes`), la estimacion baja a 6-8 GB de VRAM.
- Se recomienda una GPU de al menos 16 GB para inferencia sin cuantizacion: una RTX 3090, RTX 4090, A100 20/40 GB o H100. En 4-bit, una RTX 3060 de 12 GB o una RTX 4070 pueden ser suficientes, siempre que el modelo base completo caiga dentro de memoria junto con el adaptador.
- Opciones de despliegue: Transformers con la libreria `peft` y el tokenizer de Qwen2.5-7B-Instruct; vLLM si se fusiona previamente el adaptador con los pesos del base; llama.cpp si se convierte a formato GGUF con el adaptador fusionado. No hay datos publicados de latencia ni throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables de curacion de datos hERG basados en LLM. En el espacio de hERG/QSAR existen herramientas como HERGAI (modelo basado en XGBoost con mapas de interaccion para predecir inhibicion de hERG) y plataformas como MultiEndpointTox (prediccion multiendpoint de toxicidad a partir de SMILES), pero ninguna ofrece una funcion de extraccion estructurada de registros de ChEMBL a tarjetas JSON. Por tanto, la comparativa directa en cuanto a parametros, contextos y rendimiento no esta disponible.

## Limitaciones y advertencias

- El adaptador puede producir JSON sintacticamente valido pero con decisiones semanticamente inadecuadas. La model card advierte explicitamente que los campos `qsar_usable` y `exclude_reason` son salidas de extraccion, no decisiones cientificas autoritativas.
- La regla de admision determinista para QSAR debe recalcularse fuera del modelo: el contrato exige endpoint IC50, relacion `=`, valor numerico positivo, unidades nM/uM, ausencia de `data_validity_comment` y SMILES canonico no vacio. Si se confia solo en la salida del modelo, se pueden introducir registros erroneos en un dataset.
- No esta destinado a consejo clinico, evaluacion de pacientes, triaje autonomo de compuestos, conclusiones de seguridad, decisiones de desarrollo ni uso regulatorio.
- El soporte linguistico se limita al ingles, tanto en los datos de entrenamiento como en la interaccion esperada.
- Licencia Apache-2.0 para el adaptador, pero los datos de entrenamiento proceden de ChEMBL y estan bajo CC BY-SA 3.0. El usuario debe evaluar las obligaciones de atribucion y licencias derivadas.
- El modelo es un adaptador solo: cualquier aplicacion en produccion debe gestionar la version fijada del modelo base (`a09a35458c702b33eeacc393d103063234e8bc28`) para garantizar compatibilidad.
- No hay benchmarks publicados; no se puede afirmar una fiabilidad concreta en terminos de exactitud de extraccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparel/herg-curation-v2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio MultiEndpointTox (notebook de curacion de datos hERG): https://github.com/sharhabilMali/MultiEndpointTox-v2.2.0
- Articulo sobre HERGAI (herramienta de IA para hERG): https://link.springer.com/article/10.1186/s13321-025-01063-8
