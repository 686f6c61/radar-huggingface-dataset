# xinHesysu/bioseq-models

## Resumen

`xinHesysu/bioseq-models` es un repositorio de pesos preentrenados consumidos por el paquete Python [`bioseq-models`](https://github.com/UTR-CODE/bioseq-models), desarrollado en el ecosistema UTR-CODE. No se trata de un unico modelo generativo, sino de una coleccion de artefactos especializados en biologia computacional: prediccion de senales genomicas, diseno de secuencias, estimacion de estabilidad de ARNm y modelado de traduccion proteica. El repositorio agrupa pesos para Optimus 5-Prime, DeepSTARR (incluyendo variantes Mouse y Embryo), DeepAdapt heat shock, Malinois, DREAM LegNet, Cetnar stability, APARENT, PARM K562, Agarwal lentiMPRA, UTR-CODE y un modelo multi-especie de estabilidad de CDS basado en CodonBERT, ademas de conversiones a PyTorch de los checkpoints Saluki.

La relevancia actual del repositorio radica en su enfoque de empaquetado: el paquete descarga unicamente los ficheros requeridos por el modelo seleccionado por el usuario, lo que evita mover los 1,6 GB completos del repositorio en cada uso. La release `v0.11.1` introduce validacion estricta de recursos en el lado del paquete, de modo que el modelo de estabilidad de CDS recupera explicitamente tanto la configuracion como el checkpoint de CodonBERT y rechaza ficheros ausentes o vacios.

No se dispone de informacion sobre arquitectura unificada, numero de parametros totales ni longitud de contexto, ya que cada artefacto corresponde a un modelo distinto con su propia arquitectura (redes convolucionales, transformers especificos de codones y modelos de regresion biologica). La licencia es restrictiva: los ficheros de CodonBERT estan limitados a investigacion academica y uso no comercial, y el repositorio completo se distribuye bajo esos mismos terminos para mantener una unica licencia inequivoca sobre la coleccion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (coleccion heterogenea: CNN, transformers de codones y modelos de regresion biologica por artefacto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pt` y checkpoints nativos; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural; opera sobre secuencias de ADN, ARN y CDS) |
| Licencia | `codonbert-artifact-license` (otros: investigacion academica y uso no comercial) |
| Formato de pesos | PyTorch (`.pt`), checkpoints nativos y conversiones PyTorch de Saluki con manifiesto SHA256 |
| Tamano del repositorio | 1,6 GB |
| Version destacada | `v0.11.1` con validacion estricta de recursos en el paquete |
| Libreria | `bioseq-models` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura unica, sino que empaqueta artefactos de origenes diversos. DeepSTARR-Mouse incluye modelos separados de actividad y accesibilidad para corazon, extremidad, mesencefalo, prosencefalo, rombencefalo y tubo neural; cada recurso del paquete utiliza los seis checkpoints oficiales de tres folds de validacion cruzada y dos replicas, y la solicitud de un recurso descarga solo sus seis ficheros. DeepSTARR-Embryo contiene seis recursos de accesibilidad y cinco de actividad, cada uno con todos los checkpoints publicados por los autores que tienen parametros finitos. DeepAdapt heat shock (`deepadapt_heatshock/model.pt`) incorpora el modelo de choque termico en senescencia WI-38, dos entornos de ARN normales y dos de tratamiento, y devuelve delta, normal y treatment log2 de eficiencia de traduccion a traves del paquete Python.

El modelo de estabilidad de CDS multi-especie se apoya en CodonBERT, con ficheros bajo `cds_stability/codonbert/`. La release `v0.11.1` obliga a recuperar de forma explicita la configuracion y el checkpoint de CodonBERT, rechazando ficheros ausentes o vacios. El directorio `saluki/` contiene conversiones a PyTorch de los checkpoints originales de Saluki para humano f0_c0, humano f0_c1 y raton f0_c0, registrando los valores SHA256 nativos y convertidos en `manifest.json`; el modelo y los datos originales proceden del archivo de los autores en Zenodo, bajo CC BY 4.0, y el paper describe la puntuacion consenso de vida media y la entrada de transcrito de seis canales. La mayoria de los checkpoints son reproducciones entrenadas por el proyecto y no se presentan como pesos publicados por los autores; el detalle esta en `MODEL_PROVENANCE.md`. No se documentan volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Prediccion de actividad y accesibilidad de secuencias regulatorias mediante DeepSTARR, con variantes especificas por tejido en raton y por estadio embrionario.
- Modelado de choque termico y senescencia celular con DeepAdapt, devolviendo delta, normal y treatment log2 de eficiencia de traduccion.
- Estimacion de estabilidad de CDS multi-especie mediante CodonBERT.
- Prediccion de senales genomicas con Optimus 5-Prime, Malinois y DREAM LegNet.
- Estimacion de estabilidad de ARNm con Cetnar stability.
- Prediccion de poliadenilacion y procesamiento 3' con APARENT y PARM K562.
- Evaluacion de actividad enhancer/promotor en ensayos MPRA con Agarwal lentiMPRA.
- Modelado de elementos UTR con UTR-CODE.
- Prediccion de vida media de transcritos y procesamiento de entrada de seis canales con Saluki (conversiones PyTorch).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Priorizacion de variantes en regiones regulatorias: DeepSTARR permite puntuar el efecto de variantes sobre actividad y accesibilidad en tejidos concretos de raton, descargando solo los seis checkpoints del recurso seleccionado.
- Diseno de construcciones genicas con UTRs optimizados: UTR-CODE y Cetnar stability permiten estimar estabilidad de ARNm y rendimiento traduccional antes de sintetizar la construccion.
- Optimizacion de secuencias codificantes para expresion heterologa: el modelo de estabilidad de CDS con CodonBERT estima estabilidad de CDS multi-especie, util para elegir codones en proteinas recombinantes.
- Analisis de senescencia y respuesta a estres termico: DeepAdapt devuelve delta, normal y treatment log2 de eficiencia de traduccion en el modelo WI-38, adecuado para estudios de envejecimiento celular in vitro.
- Interpretacion de ensayos MPRA: Agarwal lentiMPRA y PARM K562 permiten contrastar predicciones con mediciones de actividad regulatoria en lineas celulares.
- Anotacion de poliadenilacion y terminacion de transcritos: APARENT predice senales de poliadenilacion para priorizar isoformas y sitios de procesamiento 3'.
- Analisis de vida media de ARNm: las conversiones Saluki en PyTorch permiten estimar el consenso de vida media a partir de entrada de transcrito de seis canales, con verificacion de integridad mediante SHA256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del artefacto concreto y de si se ejecuta en CPU o GPU.
- GPU recomendadas: no disponibles; no se documentan requisitos minimos ni modelos objetivo (A100, H100, RTX 4090 u otros).
- Ajuste en GPU de consumo: no disponible; el tamano del repositorio (1,6 GB) no equivale al de un unico modelo cargado en memoria.
- Opciones de despliegue: paquete Python `bioseq-models` con descarga selectiva de recursos; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xinHesysu/bioseq-models` | Coleccion de pesos biologicos (CNN, CodonBERT, regresion) | no disponible | no disponible | `codonbert-artifact-license` (no comercial) | Hugging Face, 0 descargas, 0 likes |
| CodonBERT (Sanofi-Public) | Transformer de codones | no disponible en la informacion | no disponible | ARTIFACT_LICENSE (no comercial) | GitHub Sanofi-Public |
| Saluki (autores originales) | Modelo de vida media de transcritos | no disponible en la informacion | no disponible | CC BY 4.0 | Zenodo, DOI 10.5281/zenodo.6326409 |
| DeepSTARR (autores originales) | CNN de actividad regulatoria | no disponible en la informacion | no disponible | no disponible en la informacion | Checkpoints referenciados por el paquete |

## Limitaciones y advertencias

- La licencia `codonbert-artifact-license` restringe el uso a investigacion academica y no comercial; el repositorio completo adopta estos terminos, por lo que no es apto para produccion comercial sin autorizacion.
- La mayoria de los checkpoints son reproducciones entrenadas por el proyecto y no pesos publicados por los autores originales; la validez de los resultados depende de `MODEL_PROVENANCE.md`.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de dominio.
- Los modelos operan sobre secuencias biologicas, no sobre lenguaje natural; no deben emplearse como modelos conversacionales ni como asistentes generales.
- El repositorio no especifica limites de longitud de secuencia de entrada, numero de parametros ni regimen de entrenamiento, lo que dificulta estimar costes de inferencia.
- La descarga selectiva exige usar el paquete `bioseq-models`; el acceso manual a los ficheros puede provocar configuraciones incompletas, riesgo que la release `v0.11.1` mitiga con validacion estricta.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de adopcion ni validacion independiente por parte de la comunidad.
- Los pesos de Saluki convertidos a PyTorch deben verificarse contra `manifest.json`; una conversion incorrecta puede alterar las predicciones de vida media.

## Enlaces

- Hugging Face: https://huggingface.co/xinHesysu/bioseq-models
- Repositorio del paquete: https://github.com/UTR-CODE/bioseq-models
- Licencia CodonBERT: https://github.com/Sanofi-Public/CodonBERT/blob/master/ARTIFACT_LICENSE.md
- Manifiesto Saluki: https://huggingface.co/xinHesysu/bioseq-models/blob/main/saluki/manifest.json
- Archivo original de Saluki: https://doi.org/10.5281/zenodo.6326409
- Paper de Saluki: https://doi.org/10.1186/s13059-022-02811-x
