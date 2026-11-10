# zaidwhys/indictrans2-en-indic-dist-200M-ct2-int8

## Resumen

IndicTrans2 en-indic dist-200M en formato CTranslate2 int8 es una conversion del modelo de traduccion automatica `ai4bharat/indictrans2-en-indic-dist-200M` desarrollado por AI4Bharat (IIT Madras). El modelo original traduce del ingles a 22 lenguas indias y esta disenado para cubrir un espacio linguistico tradicionalmente mal atendido por los sistemas de traduccion comerciales. Esta version concreta, publicada por el usuario zaidwhys, reempaqueta los pesos en CTranslate2 con cuantizacion int8 para permitir inferencia en CPU sin dependencias de PyTorch ni Fairseq.

La relevancia de esta conversion es practica: elimina la pesada pila de dependencias del modelo original (transformers, fairseq, IndicTransToolkit) y reduce el consumo de memoria a unos 707 MB en pico, con un rendimiento de aproximadamente 0,3 segundos por frase en una CPU de portatil con 4 hilos. Esto la hace util para despliegues ligeros, entornos sin GPU y aplicaciones de traduccion en tiempo casi real sobre hardware modesto.

El modelo base es de tipo transformer encoder-decoder con 200 millones de parametros (variante "dist" destilada), entrenado especificamente para la direccion ingles a lenguas indias. La licencia MIT del modelo original se conserva sin cambios, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (variante distilada del IndicTrans2) |
| Parametros totales | 200M (segun nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | en, as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (int8) |
| Tamano del repo | 0.2 GB |
| Libreria | ctranslate2 |
| Modelo base | ai4bharat/indictrans2-en-indic-dist-200M |
| Direccion de traduccion | ingles a 22 lenguas indias |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de 200 millones de parametros perteneciente a la familia IndicTrans2, publicada por AI4Bharat y descrita en el articulo de Gala et al. (TMLR 2023). La variante "dist" corresponde a una version destilada del modelo completo, pensada para reducir coste de inferencia manteniendo calidad aceptable. La model card de esta conversion no aporta detalles adicionales sobre el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo original y no se reproduce aqui.

La innovacion de esta publicacion concreta no esta en el entrenamiento sino en el empaquetado: se ha convertido el checkpoint original (`pytorch_model.bin`, con sha256 documentado en `provenance.json`) a CTranslate2 con cuantizacion int8, eliminando la dependencia de PyTorch y Fairseq. El autor declara un criterio de paridad fijado antes de la evaluacion (diferencia absoluta menor o igual a 1,0 chrF respecto al modelo original en fp32) y verifica que se cumple en las tres parejas evaluadas.

## Capacidades

- Traduccion automatica del ingles a 22 lenguas indias: asamés, bengalí, bodo, dogri, konkani, gujarati, hindi, kannada, cachemir, maithili, malayalam, manipuri, marati, nepalí, oriya, punyabí, sánscrito, santali, sindhi, tamil, telugu y urdu.
- Ejecucion en CPU sin GPU, sin PyTorch y sin Fairseq, gracias al runtime CTranslate2.
- Decodificacion por haz (beam search) con beam 5, segun la configuracion de evaluacion documentada.
- Integracion directa con el paquete `bhashantar` mediante linea de comandos.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido: es un modelo puramente de traduccion.
- No se documenta soporte multilingue fuera de las 22 lenguas indias objetivo y el ingles como origen.

## Casos de uso

- Traduccion de documentacion tecnica al hindi y otras lenguas indias: el modelo permite localizar manuales y guias de producto con un pipeline ligero que corre en CPU, sin necesidad de infraestructura GPU.
- Atencion al cliente en centros de soporte indios: se puede integrar en un servicio que reciba consultas en ingles y las muestree en la lengua del usuario (por ejemplo, tamil o bengalí) con latencia de aproximadamente 0,3 segundos por frase.
- Subtitulado y traduccion de contenido audiovisual: dado el bajo consumo de memoria (707 MB en pico), se puede ejecutar en paralelo con otras tareas en un mismo servidor modesto para procesar lotes de subtitulos.
- Traduccion de interfaces de usuario y cadenas de software: la licencia MIT permite incorporar el modelo en productos comerciales sin obligaciones de copyleft, algo relevante para empresas que localizan aplicaciones a multiples lenguas indias.
- Procesamiento por lotes en entornos sin GPU: organismos publicos o ONG con infraestructura limitada pueden traducir corpus de ingles a lenguas regionales usando solo CPU y el paquete `bhashantar`.
- Investigacion en traduccion automatica de bajos recursos: sirve como linea base reproducible y ligera para comparar tecnicas de cuantizacion o destilacion en lenguas como santali, bodo o manipuri, donde los recursos son escasos.
- Despliegue en dispositivos de borde o portatiles: al no requerir torch ni fairseq, se puede empaquetar en aplicaciones de escritorio o contenedores minimos para traduccion offline.

## Benchmarks y rendimiento

Evaluacion de paridad declarada por el autor sobre FLORES-200 devtest, primeras 100 frases, beam 5. Referencia: modelo original en fp32 con transformers 4.50.3 e IndicTransToolkit 1.1.1.

| Par de traduccion | chrF referencia | chrF este modelo | Delta |
|---|---|---|---|
| eng_Latn-hin_Deva | 65,69 | 65,17 | -0,52 |
| eng_Latn-ben_Beng | 54,52 | 54,62 | +0,10 |
| eng_Latn-tam_Taml | 61,33 | 61,59 | +0,27 |

Solo se evaluaron tres de las 22 lenguas objetivo. El autor indica que la salida en santali mezcla escrituras en algunas frases, igual que ocurre en el modelo original. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta pensado para CPU. En GPU el consumo seria minimo (inferior a 1 GB en int8).
- Memoria RAM en pico: aproximadamente 707 MB con 4 hilos de CPU, segun el autor.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU con soporte CTranslate2 podria ejecutarlo, pero el caso de uso documentado es CPU.
- Cabe en cualquier portatil convencional; no requiere GPU de consumo.
- Opciones de despliegue: CTranslate2 (runtime nativo), paquete `bhashantar` (CLI y presumiblemente API Python). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de modelo encoder-decoder.
- Latencia: aproximadamente 0,3 segundos por frase en CPU de portatil con 4 hilos (beam 5). No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (IndicTrans2 dist-200M ct2 int8) | 200M | en a 22 lenguas indias | no disponible | MIT | CTranslate2 int8 | CPU, sin torch ni fairseq, 707 MB pico |
| ai4bharat/indictrans2-en-indic-dist-200M | 200M | en a 22 lenguas indias | no disponible | MIT | PyTorch (fairseq) | Modelo original en fp32, requiere IndicTransToolkit |
| ai4bharat/indictrans2-en-indic-1B | 1B | en a 22 lenguas indias | no disponible | MIT | PyTorch (fairseq) | Variante completa, mayor calidad esperada a mayor coste |
| NLLB-200 (variantes 600M/1.3B) | 600M-1.3B | multilingue (200 lenguas) | no disponible | CC-BY-NC (segun version) | PyTorch / CTranslate2 | Cobertura mas amplia pero licencia no comercial en algunas variantes |

La comparativa se limita a lo que puede inferirse de la informacion disponible; no se dispone de cifras de rendimiento comparadas entre estas alternativas mas alla de las tres parejas evaluadas frente al modelo original.

## Limitaciones y advertencias

- Solo traduce en la direccion ingles a lenguas indias; no soporta la direccion inversa ni traduccion entre lenguas indias.
- Solo se han verificado tres de las 22 lenguas en la prueba de paridad; el resto no tiene validacion documentada en esta conversion.
- El santali puede presentar mezcla de escrituras en algunas frases, comportamiento heredado del modelo original.
- Riesgo de alucinacion y de traducciones imperfectas en dominios especializados (medico, legal, tecnico) no cubiertos por el entrenamiento; requiere revision humana en produccion.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo original, no documentados en esta model card.
- No se documenta la longitud maxima de contexto ni el comportamiento con entradas largas.
- Aunque la licencia es MIT y permite uso comercial, conviene citar el articulo de IndicTrans2 (Gala et al., TMLR 2023) segun solicita el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente sin validacion comunitaria amplia.
- La fecha de creacion indicada (2026-11-10) es futura respecto a la mayoria de referencias; conviene verificar la integridad de los pesos mediante el sha256 documentado en `provenance.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaidwhys/indictrans2-en-indic-dist-200M-ct2-int8
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Paquete bhashantar en PyPI: https://pypi.org/project/bhashantar/
- Paper de IndicTrans2 (Gala et al., TMLR 2023): no disponible en la informacion proporcionada
- Repositorio de AI4Bharat IndicTrans2: no disponible en la informacion proporcionada
- Documentacion de CTranslate2: no disponible en la informacion proporcionada
