# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed0` es un checkpoint de investigacion derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho` en HuggingFace. No es un modelo generalista nuevo, sino el resultado de aplicar una tecnica de *machine unlearning* (desaprendizaje) denominada RMU sobre un fine-tune previo del modelo base. El objetivo es eliminar el conocimiento asociado a un conjunto concreto de pares pregunta-respuesta (el *forget set* de TOFU, 400 pares) manteniendo la utilidad general del modelo.

El modelo forma parte de la coleccion TOFU-para, que distingue explicitamente entre *untraining* (borrar las muestras exactas vistas por el metodo) y *unlearning* (borrar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones). Para ello se entrena sobre TOFU con erratas en nombres corregidas y cinco parafrasis verificadas de cada par QA. Este checkpoint concreto aplica RMU (Representation Misdirection for Unlearning) usando la implementacion de `open-unlearning` de locuslab.

Su relevancia es fundamentalmente metodologica: sirve para estudiar si las tecnicas de desaprendizaje generalizan a reformulaciones del mismo conocimiento, un problema abierto en privacidad de modelos y cumplimiento normativo. La ficha tecnica se limita a lo publicado por el autor; no hay documentacion adicional sobre el entrenamiento del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens segun la familia, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (bfloat16 recomendado en el ejemplo de uso) |
| Idiomas soportados | no disponible en la model card (heredados de Llama 3.1) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer decoder-only denso con 8.030 millones de parametros. El checkpoint no introduce cambios arquitectonicos; la diferencia respecto al modelo base reside exclusivamente en los pesos tras el proceso de desaprendizaje.

El pipeline de entrenamiento documentado es el siguiente. Primero, un fine-tune (`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) sobre el dataset TOFU-para completo: TOFU con erratas de nombres corregidas mas dos versiones de parafrasis (`para1`, `para2`) de cada par QA. Sobre ese modelo se aplica RMU con la implementacion de `open-unlearning`, usando como *forget set* unicamente los 400 pares QA originales de `forget10` y como *retain set* `retain90 + para1 + para2` (10.800 ejemplos). Los hiperparametros son los valores por defecto de RMU en `open-unlearning`, sin recorte de gradiente, con batch efectivo de 32 y semilla 0 (tanto la del modelo de partida como la del run de desaprendizaje). La configuracion exacta esta en `train_config/` del repositorio.

La innovacion tecnica destacable no esta en la arquitectura sino en la evaluacion: la metrica FADE (divergencia KL simetrica respecto a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) mide la dificultad de distinguir el modelo desaprendido del de referencia, y se reporta por separado para el *forget set* original y cada parafrasis.

## Capacidades

- Generacion de texto conversacional: hereda el formato instruct de Llama 3.1 (chat template, turnos system/user/assistant).
- Razonamiento y conocimiento general: presumiblemente conserva la utilidad del modelo base, con `model utility` reportado de 0,659 en la evaluacion TOFU.
- Capacidades multilingues: no documentadas en la model card; dependen de lo que conserve el fine-tune sobre TOFU.
- Tool calling / function calling: no documentado para este checkpoint; el modelo base Llama 3.1 Instruct lo soporta, pero no hay confirmacion de que el fine-tune y el desaprendizaje lo preserven.
- Uso como objeto de estudio de desaprendizaje: capacidad principal del checkpoint, con metricas FADE y TOFU forget quality publicadas.
- No se documentan capacidades de vision, audio, modo thinking ni agentes multi-paso.

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como referencia para comparar metodos (RMU frente a otras tecnicas) sobre el mismo *forget set* y el mismo modelo de partida, aprovechando que la coleccion TOFU-para fija semilla y datos.
- Evaluacion de generalizacion del desaprendizaje: medir si el borrado de los 400 pares originales se extiende a `para1` y `para2` mediante FADE, que es precisamente el eje del benchmark; util para estudiar si el metodo elimina conocimiento o solo muestras.
- Auditoria de privacidad de modelos: reproducir el experimento para comprobar si un modelo fine-tuneado con datos sensibles sigue respondiendo a reformulaciones de esos datos tras aplicar RMU.
- Desarrollo de pipelines de desaprendizaje: servir de ejemplo reproducible (config en `train_config/`, evaluaciones en `evals/`) para integrar `open-unlearning` en flujos propios con Llama 3.1 8B.
- Estudio de la relacion utilidad-olvido: analizar el compromiso entre `model utility` (0,659) y las metricas de olvido (`forget Q-A probability` 0,016, `forget truth ratio` 0,738) en un modelo de 8 B.
- Baseline en articulos y tesis: citar como resultado de referencia para RMU con semilla 0 sobre TOFU-para, junto con los demas checkpoints de la coleccion.
- Docencia en cursos de seguridad y privacidad de IA: ilustrar con un caso real y reproducible las diferencias entre *untraining* y *unlearning*.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (todos sobre la evaluacion TOFU-para):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `...-x2-retain90-forget10para-seed0`, forget10 original) | 504,05 |
| FADE, unlearning (vs `...-x2-retain90-seed0`, forget10 original + 2 parafrasis) | 478,18 (original 472,2 / para1 483,2 / para2 479,1) |
| TOFU forget quality (vs `...-x2-retain90-seed0`) | 6,16e-18 |
| Forget truth ratio | 0,738 |
| Forget Q-A probability | 0,016 |
| Forget Q-A ROUGE | 0,073 |
| Model utility | 0,659 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los resultados por pregunta estan en `evals/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contextos moderados.
- Cuantizacion: no se publican GGUF ni cuantizaciones oficiales; al ser un Llama 3.1 8B estandar, es convertible con llama.cpp o herramientas equivalentes, pero no hay artefactos verificados en el repositorio.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4090 sirven para inferencia en precision reducida.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con 16 GB o mas en cuantizacion de 8 bits; en 4 bits cabria en 12 GB, aunque sin cuantizaciones oficiales publicadas.
- Opciones de despliegue: `transformers` (soporte confirmado), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp tras conversion, aunque no estan documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (RMU, seed 0) | 8,03 B | no disponible | Desaprendizaje RMU sobre TOFU-para | Llama 3.1 Community | HuggingFace, 317 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (modelo de partida) | 8,03 B | no disponible | Fine-tune completo sobre TOFU-para | Llama 3.1 Community | HuggingFace |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (referencia de evaluacion) | 8,03 B | no disponible | Fine-tune solo con retain90 | Llama 3.1 Community | HuggingFace |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (referencia de untraining) | 8,03 B | no disponible | Fine-tune sin forget10 original | Llama 3.1 Community | HuggingFace |

La comparacion con modelos de la misma categoria (otros metodos de desaprendizaje sobre Llama 3.1 8B, como NPO, GradDiff o SimNPO) no esta disponible en la informacion proporcionada; la coleccion TOFU-para esta disenada precisamente para permitir esas comparaciones, pero no se aportan cifras de terceros.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado como asistente de produccion; su proposito es medir desaprendizaje, no ofrecer un chatbot pulido.
- El desaprendizaje es parcial: `forget Q-A probability` de 0,016 no es cero y `forget truth ratio` de 0,738 indica respuestas parcialmente correctas; el conocimiento puede persistir en formulaciones no cubiertas por el benchmark.
- FADE de 478,18 en *unlearning* frente a 504,05 en *untraining* sugiere que el modelo sigue siendo distinguible del de referencia; no hay garantia de olvido completo.
- Riesgo de alucinacion: heredado de Llama 3.1 8B Instruct, sin mitigaciones adicionales documentadas.
- Sesgos: no documentados en la model card; se heredan los del modelo base y los del dataset TOFU-para.
- Idiomas: no se especifica que idiomas conserva tras el fine-tune y el desaprendizaje; no asumir cobertura multilingue.
- Licencia Llama 3.1 Community: impone restricciones de uso (incluida la clausula de 700 millones de usuarios mensuales y las politicas de uso aceptable de Meta); no es una licencia de codigo abierto permisiva y requiere revision legal antes de uso comercial.
- Trazabilidad limitada: la model card no documenta el proceso de fine-tune del modelo de partida ni los detalles del dataset TOFU-para mas alla de la descripcion resumida.
- Fecha de creacion del repositorio (2026-11-02) posterior a la del modelo base Llama 3.1; conviene verificar la procedencia de los pesos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed0
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Implementacion de RMU usada: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio como `LICENSE`
