# tanmay891/tiny-aya-indicfin-rft

## Resumen

`tanmay891/tiny-aya-indicfin-rft` es un adaptador LoRA publicado en Hugging Face que se aplica sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo de lenguaje de la familia Tiny Aya de Cohere Labs. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) y RFT (rejection fine-tuning, segun sugiere el sufijo del nombre), con un enfoque aparente en dominio financiero y contenido indico, a juzgar por el identificador "indicfin". La informacion publicada por el autor es practicamente inexistente: la model card es la plantilla por defecto de Hugging Face sin rellenar.

El repositorio tiene un tamano de 0,3 GB, coherente con un adaptador LoRA (no con un modelo completo), y fue creado el 10 de noviembre de 2026. La libreria declarada es PEFT 0.21.2 y las etiquetas indican el uso de TRL y Unsloth en el pipeline de entrenamiento. No se declaran licencia, idiomas soportados ni datos de evaluacion.

La relevancia de esta ficha es limitada: se trata de un adaptador de autor individual, sin descargas ni likes en el momento de la consulta, sin documentacion tecnica y sin resultados de benchmarks. Resulta util unicamente como referencia de un experimento de fine-tuning sobre Tiny Aya, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (adaptador LoRA; el tamano del repo es de 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el nombre sugiere enfoque indico, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se carga sobre `CohereLabs/tiny-aya-global`. No se trata por tanto de un modelo con pesos completos, sino de un conjunto de matrices de bajo rango que modifican las proyecciones del modelo base. Las etiquetas del repositorio confirman el uso de PEFT 0.21.2, TRL y Unsloth, lo que indica un flujo de entrenamiento tipico de fine-tuning supervisado con optimizaciones de memoria de Unsloth y el trainer de TRL.

El nombre del repositorio sugiere dos fases: un ajuste supervisado (SFT) seguido de un ajuste por rechazo (RFT, rejection fine-tuning), una tecnica en la que se generan multiples respuestas por prompt, se filtran las mejores mediante un criterio de recompensa o verificador, y se reentrena sobre ellas. El dominio "indicfin" apunta a un corpus financiero en lenguas indicas, pero no hay ninguna confirmacion en la model card, que permanece como plantilla vacia. No se documentan hiperparametros, numero de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Tiny Aya Global.
- Ajuste especifico (presuntamente) a terminologia y tareas financieras en lenguas indicas, segun el identificador del repositorio; sin verificacion documental.
- Soporte multilingue limitado a lo que ofrezca el modelo base; no declarado por el autor.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica con fine-tuning LoRA: sirve como ejemplo reproducible de un pipeline SFT + RFT sobre Tiny Aya con TRL y Unsloth, util para quienes quieran replicar la receta.
- Prototipado de asistentes financieros en lenguas indicas: el adaptador podria emplearse para probar respuestas sobre terminologia financiera local, siempre que se valide su calidad con un conjunto de evaluacion propio.
- Investigacion sobre adaptadores de bajo rango: al ser un LoRA de 0,3 GB, permite estudiar como un ajuste pequeno modifica el comportamiento del modelo base en un dominio concreto.
- Base para comparativas de tecnicas de alineacion: comparar este adaptador con variantes solo-SFT o con DPO permitiria medir el efecto del RFT en un dominio especifico.
- Generacion de borradores de texto financiero en fase de exploracion: con revision humana obligatoria, para tareas de resumen o clasificacion de documentos.
- Docencia y formacion: como caso practico de publicacion de adaptadores PEFT en Hugging Face y de las carencias habituales en model cards de experimentos individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,3 GB y se puede cargar en cualquier GPU que soporte el modelo base.
- VRAM estimada: depende enteramente de `CohereLabs/tiny-aya-global`; no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; al tratarse de un modelo base de la familia Tiny Aya (tamano reducido), es probable que quepa en GPUs de consumo, pero no se confirma.
- Despliegue: compatible con el ecosistema PEFT + transformers; tambien podria fusionarse con el modelo base y exportarse a GGUF para llama.cpp u Ollama, aunque no se documenta el procedimiento.
- vLLM y TGI: soportan adaptadores LoRA de forma nativa, pero la compatibilidad concreta con este adaptador no esta verificada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanmay891/tiny-aya-indicfin-rft | Adaptador LoRA sobre Tiny Aya Global | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global | Modelo base completo | no disponible en esta ficha | no disponible | no disponible | Hugging Face (modelo oficial) |
| Adaptadores LoRA comunitarios sobre Tiny Aya | Adaptadores PEFT | variable | heredado del base | variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base.
- Riesgo elevado de alucinacion en dominio financiero: un adaptador entrenado con RFT sobre datos no documentados puede producir afirmaciones incorrectas con apariencia de rigor.
- Idiomas no confirmados: el sufijo "indic" sugiere lenguas indicas, pero no se especifica cuales ni con que cobertura.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad.
- Dependencia del modelo base: cualquier limitacion de Tiny Aya Global (sesgos, contexto, idiomas) se hereda.
- No apto para produccion sin una evaluacion propia exhaustiva y sin clarificar la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tanmay891/tiny-aya-indicfin-rft
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
