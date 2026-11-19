# virtual-human-chc/hyformer_molecules_8M

## Resumen

Hyformer es un modelo transformer de dominio cientifico desarrollado por el grupo de investigacion de Ewa Szczurek (Szczurek Lab, Universidad de Varsovia) y presentado en el articulo "Synergistic Benefits of Joint Molecule Generation and Property Prediction" (arXiv:2504.16559, 2025). Su particularidad es que unifica en una sola arquitectura un decodificador generativo de moleculas y un codificador predictivo de propiedades, alternando entre mascara causal y bidireccional segun la tarea. Esta ficha cubre el checkpoint `hyformer_molecules_8M`, entrenado sobre el conjunto GuacaMol.

El modelo resuelve un problema clasico del diseno molecular computacional: los modelos generativos y los predictivos suelen entrenarse por separado, lo que dificulta optimizar propiedades quimicas durante la generacion. Hyformer plantea un entrenamiento conjunto que, segun los autores, aporta beneficios sinergicos en ambas tareas. Con aproximadamente 8 millones de parametros, esta pensado como punto de partida ligero y reproducible para experimentacion en diseno de moleculas y prediccion de propiedades.

El checkpoint se distribuye con acceso restringido (gated) en Hugging Face bajo licencia BSD 3-Clause, con un formulario que exige declarar organizacion, uso previsto y aceptacion de clausulas de uso etico. El repositorio ocupa unos 0,1 GB y esta etiquetado con los datasets GuacaMol, ZINC y MoleculeNet, aunque este checkpoint concreto se entrena solo con GuacaMol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador generativo + codificador predictivo unificados; mascara causal o bidireccional segun tarea) |
| Parametros totales | 8M (segun el nombre del checkpoint; no se detalla el desglose en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio molecular, no linguistico) |
| Licencia | BSD 3-Clause, con acceso restringido (gated) y clausulas de uso etico |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Hyformer es un transformer unico que integra dos modos de funcionamiento. En modo generativo aplica una mascara causal y produce probabilidades sobre tokens de moleculas (representacion tipo SMILES, aunque la model card no lo explicita); en modo predictivo aplica una mascara bidireccional y devuelve valores de propiedades. Esta dualidad permite entrenar ambas tareas de forma conjunta sobre la misma red, en lugar de mantener dos modelos separados.

El checkpoint `hyformer_molecules_8M` se entrena sobre el dataset GuacaMol (Brown et al., 2019), un benchmark de referencia para diseno molecular de novo. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO; el articulo asociado es la fuente para esos detalles. La innovacion principal es el entrenamiento conjunto generacion-prediccion, que los autores describen como mutuamente beneficioso.

## Capacidades

- Generacion de moleculas de novo mediante decodificacion autorregresiva con mascara causal.
- Prediccion de propiedades moleculares mediante codificacion bidireccional.
- Entrenamiento conjunto de ambas tareas en una sola red, lo que permite reutilizar representaciones.
- Ajuste fino conjunto sobre propiedades especificas (el ecosistema incluye un checkpoint de peptidos ajustado con valores MIC).
- Orientado a quimica computacional y descubrimiento de farmacos; no es un modelo de lenguaje general.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (fuera del alcance del modelo).

## Casos de uso

- Generacion de librerias de moleculas candidatas: el modo generativo produce estructuras nuevas a partir de las distribuciones aprendidas de GuacaMol, util para exploracion temprana de espacio quimico.
- Filtrado predictivo de candidatos: el mismo modelo, en modo bidireccional, estima propiedades de las moleculas generadas, reduciendo el numero de compuestos que pasan a sintesis o simulacion costosa.
- Ajuste fino para propiedades concretas: partiendo del checkpoint de 8M, se puede reentrenar de forma conjunta para optimizar una propiedad objetivo, como se hizo con el checkpoint de peptidos y MIC frente a E. coli.
- Investigacion academica y reproduccion: su tamano reducido (8M) y su licencia permisiva lo hacen adecuado para experimentos docentes y para validar metodologias de entrenamiento conjunto.
- Prototipado rapido en pipelines de diseno molecular: al ser ligero, se integra en flujos de generacion-evaluacion iterativos sin requerir infraestructura pesada.
- Benchmarking de metodos generativos: sirve como linea base reproducible frente a otros modelos evaluados en GuacaMol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 8M de parametros, la huella de pesos en fp32 es de aproximadamente 32 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, con margen amplio (incluso en GPUs de gama baja o en CPU para inferencia puntual).
- Opciones de despliegue: no disponibles en la model card; al ser un transformer estandar en PyTorch, es desplegable con frameworks genericos, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hyformer_molecules_8M | 8M | no disponible | Generacion + prediccion molecular | BSD 3-Clause (gated) | Hugging Face (acceso restringido) |
| Hyformer_molecules_50M | 50M | no disponible | Generacion + prediccion molecular | BSD 3-Clause (gated) | Hugging Face (acceso restringido) |
| Hyformer_peptides_34M | 34M | no disponible | Generacion + prediccion de peptidos | BSD 3-Clause (gated) | Hugging Face (acceso restringido) |
| Otros modelos de diseno molecular | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no proporciona comparaciones cuantitativas con modelos externos; la unica comparativa disponible es interna, entre los checkpoints de la propia familia Hyformer.

## Limitaciones y advertencias

- El checkpoint de 8M se entrena exclusivamente con GuacaMol, por lo que su cobertura del espacio quimico es limitada frente al checkpoint de 50M, entrenado con 19M de moleculas de ZINC, ChEMBL y otros conjuntos.
- No se documentan sesgos especificos, pero al derivar de un dataset acotado puede reproducir los sesgos de distribucion de GuacaMol.
- Riesgo de generar moleculas quimicamente invalidas o no sintetizables; no se reportan tasas de validez en la informacion disponible.
- No es un modelo de lenguaje: no soporta idiomas, tool calling ni tareas fuera del dominio molecular.
- Licencia BSD 3-Clause permite uso comercial, pero el acceso es gated y exige aceptar clausulas de uso no malicioso y eticamente responsable; conviene revisar los terminos antes de integrarlo en produccion.
- No se especifican requisitos de contexto, cuantizacion ni formato de pesos, lo que dificulta planificar el despliegue sin consultar el repositorio de GitHub.
- Para uso en produccion farmaceutica, la validacion experimental (sintesis, ensayos) sigue siendo imprescindible; el modelo es una herramienta de cribado, no un sustituto.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/hyformer_molecules_8M
- Checkpoint de 50M: https://huggingface.co/SzczurekLab/hyformer_molecules_50M
- Checkpoint de peptidos 34M: https://huggingface.co/SzczurekLab/hyformer_peptides_34M
- Checkpoint de peptidos 34M ajustado con MIC: https://huggingface.co/SzczurekLab/hyformer_peptides_34M_MIC
- Articulo: https://arxiv.org/abs/2504.16559
- Repositorio GitHub: https://github.com/szczurek-lab/hyformer
- GuacaMol (Brown et al., 2019): https://jcheminf.biomedcentral.com/articles/10.1186/s13321-019-0351-9
- Uni-Mol (Zhou et al., 2023): https://openreview.net/forum?id=1pPpKc9wR0Y
