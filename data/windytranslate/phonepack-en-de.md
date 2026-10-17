# WindyTranslate/phonepack-en-de

## Resumen

WindyTranslate/phonepack-en-de es un paquete de traduccion ingles-aleman pensado para ejecucion en dispositivo ("phone pack"), publicado por WindyTranslate (Windstorm Labs) para el modo offline de su producto Windy Traveler. No es un modelo entrenado desde cero: parte de WindyTranslate/translate-en-de (commit `751ef36`), a su vez derivado del OPUS-MT `Helsinki-NLP/opus-mt-en-de` de la Universidad de Helsinki, y lo convierte a ONNX con cuantizacion int8. El resultado es un artefacto de 80,1 MB que incluye todo lo necesario para inferir: pesos, `pack.json` con checksums sha256, regla de tokenizacion y ajustes de decodificacion, mas `test_vectors.json` con 20 frases y sus ids/outputs esperados para validar portes.

Su relevancia es practica: demuestra como empaquetar un modelo de traduccion neuronal clasico (familia MarianMT) en un formato ligero, verificable y sin dependencias de framework, apto para movil y entornos sin red. Frente a alternativas multimodelo de cientos de millones de parametros, aqui el objetivo no es cobertura linguistica amplia ni calidad estado del arte, sino un binario pequeno con calidad medida y reproducible sobre un benchmark publico.

La unica evaluacion publicada en la informacion disponible es FLORES-200 devtest completo (1.012 frases) con beam 4: chrF++ 60,72 y spBLEU 42,45. El autor advierte explicitamente de que la traduccion automatica requiere revision humana en cualquier uso con consecuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, heredada de OPUS-MT en-de); no se detalla en la informacion proporcionada mas alla de la conversion a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante publicada en este pack) |
| Idiomas soportados | en (ingles), de (aleman) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8) + `embed.bin` con el embedding compartido almacenado una sola vez; manifiesto `pack.json`; vectores de test en JSON |

Otros datos del repositorio: tamano del repo 0,1 GB, descarga declarada 80,1 MB, pipeline `translation`, creado y actualizado el 2026-10-17, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El pack no introduce entrenamiento nuevo: hereda los pesos de WindyTranslate/translate-en-de, un fine-tune de `Helsinki-NLP/opus-mt-en-de`, que pertenece a la familia OPUS-MT basada en la arquitectura MarianMT (transformer encoder-decoder con atencion completa, pensado originalmente para traduccion por segmentos). Windstorm Labs declara haber modificado los pesos upstream y, para este paquete, haber realizado una conversion adicional a ONNX y una cuantizacion a int8. La informacion disponible no especifica el volumen de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas de RLHF o DPO; en la practica, un modelo de traduccion de esta familia se entrena de forma supervisada sobre corpus paralelos, pero ese detalle no se documenta aqui.

La innovacion tecnica del paquete es de empaquetado mas que de modelado: (1) cuantizacion int8 que reduce el binario a 80,1 MB, (2) almacenamiento unico del embedding compartido en `embed.bin` para evitar duplicar la matriz mas grande, (3) un manifiesto `pack.json` autocontenido con hashes sha256, regla de tokenizacion y parametros de decodificacion, y (4) vectores de test con ids de tokens y salidas esperadas para verificar la equivalencia de una implementacion portada. No se mencionan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Traduccion de texto directa en-de: unica direccion documentada (el pipeline declarado es `translation` y los idiomas son `en` y `de`).
- Inferencia en dispositivo y offline: pensado para el modo sin conexion de Windy Traveler, sin llamadas a servicios externos.
- Ejecucion sobre runtime ONNX con pesos int8, sin necesidad de PyTorch.
- Decodificacion configurable por `pack.json` (la evaluacion publicada usa beam 4), lo que permite ajustar latencia frente a calidad.
- Verificacion de portabilidad: `test_vectors.json` permite comprobar que un port produce los mismos ids de tokens y salidas esperadas en 20 frases de devtest.
- Integridad reproducible: hashes sha256 por fichero en el manifiesto.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking".

## Casos de uso

- Traduccion offline en aplicaciones moviles de viaje: el paquete se embebe en la app y traduce texto en-de en el dispositivo, sin coste de red ni exposicion de datos del usuario a un servidor; encaja por sus 80,1 MB y su formato ONNX int8.
- Traduccion de interfaz y contenidos estaticos en productos con requisitos de privacidad: al ejecutarse localmente, el texto no sale del dispositivo, lo que simplifica el cumplimiento en entornos con datos sensibles.
- Prestacion de servicios en zonas con conectividad limitada o coste de roaming: el modo offline evita depender de API externas en aeropuertos, trenes o zonas rurales.
- Traduccion asistida por humanos en soporte y documentacion: generar un borrador en-de y pasarlo por revision humana, tal como advierte el autor; util para tickets, correos y notas internas donde el volumen es alto y el riesgo bajo.
- Integracion en pipelines de CI para validacion de traducciones: usar `test_vectors.json` como test de regresion que verifica que un cambio en el runtime o en el port no altera los ids de tokens ni las salidas esperadas.
- Prototipado de funciones de traduccion en navegador o en el borde de la red: al ser ONNX, puede ejecutarse con runtimes web o embebidos sin servidor GPU, lo que abarata experimentos y demos.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de int8 frente a otras implementaciones sobre el mismo conjunto de test.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre FLORES-200 devtest, las 1.012 frases, beam 4:

| Metrica | phonepack-en-de (ONNX int8) | Referencia: CTranslate2 int8 del mismo modelo |
|---|---|---|
| chrF++ | 60,72 | 60,95 |
| spBLEU | 42,45 | no disponible |
| Conjunto de evaluacion | FLORES-200 devtest (1.012 frases) | FLORES-200 devtest (1.012 frases) |
| Beam | 4 | 4 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas que no sean traduccion. La diferencia de 0,23 puntos de chrF++ respecto a CTranslate2 int8 es la unica comparacion cuantitativa aportada.

## Requisitos de hardware

- VRAM: no aplica en la mayoria de despliegues; el paquete es de 80,1 MB en disco y la inferencia cabe en CPU. En GPU, el modelo completo en int8 ocuparia del orden de decenas o pocos cientos de MB incluyendo buffers de activaciones, muy por debajo de cualquier GPU actual (estimacion, no medida publicada).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060/4060/4090) e incluso en iGPU; tambien en moviles de gama media, que es el objetivo declarado del pack.
- GPU recomendadas: no se especifican; para esta escala no se justifica GPU dedicada salvo que se procesen muchos segmentos en paralelo.
- Opciones de despliegue: ONNX Runtime (escritorio, servidor y movil) y runtimes ONNX para web/embebido. No se documenta soporte para vLLM, TGI ni llama.cpp, que estan orientados a modelos generativos de otra escala; tampoco se publica una variante especifica para CTranslate2 en este repositorio (la referencia a CTranslate2 int8 alude al modelo base, no a este pack).
- Latencia y throughput: no disponibles. El autor solo publica calidad (chrF++/spBLEU) con beam 4, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Calidad medida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| WindyTranslate/phonepack-en-de | no disponible | no disponible | en-de | chrF++ 60,72 / spBLEU 42,45 (FLORES-200 devtest, beam 4) | ONNX int8, 80,1 MB | CC-BY-4.0 | HuggingFace, 0 descargas |
| WindyTranslate/translate-en-de (base) | no disponible | no disponible | en-de | no disponible en la informacion proporcionada | no disponible (pesos originales del modelo base) | CC-BY-4.0 (heredada) | HuggingFace |
| Helsinki-NLP/opus-mt-en-de (upstream) | no disponible en la informacion proporcionada | no disponible | en-de | no disponible en la informacion proporcionada | pesos MarianMT/Transformers | CC-BY-4.0 | HuggingFace, ampliamente usado |
| CTranslate2 int8 de translate-en-de | no disponible | no disponible | en-de | chrF++ 60,95 (FLORES-200 devtest, beam 4) | CTranslate2 int8 | CC-BY-4.0 | referenciado por el autor, no enlazado |

La comparacion con modelos multimodelo tipo NLLB o M2M-100 no se puede sostener con datos: la informacion proporcionada no incluye sus resultados ni sus especificaciones, y la licencia y el objetivo de despliegue (80 MB en dispositivo) son distintos.

## Limitaciones y advertencias

- Una sola direccion: en a de. No hay traduccion inversa ni otros pares idiomaticos en este paquete.
- Calidad lejos de estado del arte: chrF++ 60,72 y spBLEU 42,45 sobre FLORES-200 devtest con beam 4; el propio autor indica que la traduccion automatica necesita revision humana para cualquier uso relevante.
- Perdida por cuantizacion: 0,23 puntos de chrF++ frente a la variante CTranslate2 int8, y se desconoce la diferencia frente a los pesos en fp32 porque no se publica.
- Riesgo de alucinacion y de errores de sentido en frases largas, idiomaticas o con terminologia especializada; no hay datos sobre comportamiento con entradas fuera de dominio.
- Longitud de contexto no documentada: no se especifica el maximo de tokens por segmento ni como se comporta con parrafos largos; habra que trocear la entrada.
- Idiomas y dominios no cubiertos: sin garantias para variantes dialectales, registro coloquial, jerga tecnica o texto con formato enriquecido.
- Sesgos: no se documenta ninguna evaluacion de sesgo, genero gramatical o representacion; el aleman exige decisiones de genero que el modelo tomara sin control explicito.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribucion. La card exige reproducir el texto de atribucion a WindyTranslate/translate-en-de (Windstorm Labs), a Helsinki-NLP/opus-mt-en-de y a la licencia CC-BY-4.0, y declarar las modificaciones (conversion a ONNX y cuantizacion int8). Omitir esa atribucion incumple la licencia.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; sin evidencia de uso en produccion ni de mantenimiento posterior.
- Dependencia de un manifiesto propio: el runtime debe interpretar `pack.json` y respetar la tokenizacion declarada; portar mal esa regla invalida los resultados, de ahi la utilidad de `test_vectors.json`.
- Ausencia de soporte documentado para servidores de inferencia habituales (vLLM, TGI), lo que limita su uso a gran escala sin trabajo adicional de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WindyTranslate/phonepack-en-de
- Modelo base: https://huggingface.co/WindyTranslate/translate-en-de
- Modelo upstream OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-de
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Windstorm Labs: https://windstormlabs.com
- No se han encontrado en la busqueda web articulos, papers, blogs, repositorios ni demos relacionados con este modelo; los resultados devueltos no guardan relacion con el contenido de esta ficha.
