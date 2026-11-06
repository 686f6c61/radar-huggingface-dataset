# tuoyi-ai/top-ai-tuoyi-apps

## Resumen

`tuoyi-ai/top-ai-tuoyi-apps` es un repositorio alojado en Hugging Face que, pese a su identificador y a la etiqueta de licencia Apache 2.0, no contiene un modelo de inteligencia artificial. La model card publicada por el autor consiste en una pagina promocional en chino (con CSS embebido y tablas comparativas) que recomienda herramientas comerciales de "desnudado" de imagenes mediante IA, es decir, software de generacion de imagenes sexuales no consentidas a partir de fotos de personas vestidas.

No se dispone de informacion sobre arquitectura, parametros, longitud de contexto, datos de entrenamiento ni pesos. El repositorio no expone pipeline, no declara idiomas soportados y acumula 0 descargas y 1 like en la fecha de consulta. El contenido de la model card es material de spam/SEO y no constituye documentacion tecnica de un modelo.

Esta ficha se redacta por rigor documental: cualquier desarrollador o investigador que encuentre este repositorio debe saber que no hay nada que evaluar tecnicamente y que su contenido plantea problemas legales y eticos graves en la mayoria de jurisdicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta en chino) |
| Licencia | Apache 2.0 (declarada en metadatos, sin pesos asociados) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No existe arquitectura ni proceso de entrenamiento documentado. El repositorio no incluye ficheros de pesos (safetensors, GGUF ni otros), no declara configuracion de transformer, MoE ni SSM, y no referencia ningun paper, dataset o pipeline de RLHF/DPO. La model card se limita a HTML con estilos CSS y enlaces promocionales, sin seccion tecnica alguna.

No se ha publicado informacion sobre tokens de entrenamiento, composicion del dataset ni innovaciones tecnicas. Cualquier afirmacion sobre capacidades del "modelo" seria especulativa y no estaria respaldada por los artefactos del repositorio.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No hay soporte declarado de function calling ni de razonamiento multi-paso.
- No hay capacidades multilingues declaradas.
- El unico "contenido" del repositorio es una pagina promocional en chino que lista herramientas de terceros para generar imagenes sexuales no consentidas.

## Casos de uso

No se identifican casos de uso legitimos. El repositorio no ofrece un modelo desplegable. A continuacion se enumeran escenarios en los que un equipo podria encontrarse este repositorio y la conducta recomendada:

- Auditoria de cadena de suministro de modelos: detectar repositorios de spam o maliciosos en busquedas de Hugging Face antes de incorporarlos a pipelines; este repositorio debe marcarse como no apto y reportarse.
- Filtrado de datasets: excluir este tipo de repositorios de crawls automatizados y de indices internos de modelos.
- Formacion en seguridad: usarlo como ejemplo de model card abusiva que suplanta la licencia Apache 2.0 sin contener artefactos tecnicos.
- Respuesta a incidentes: si aparece referenciado en dependencias o scripts internos, bloquear la descarga y revisar el origen.
- Cumplimiento normativo: documentar la existencia del repositorio si un cliente o proveedor lo cita, para justificar su exclusion de evaluaciones.
- Investigacion sobre spam SEO en plataformas de modelos: analizar el patron de model cards promocionales con CSS embebido y enlaces de afiliacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen pesos ni evaluaciones tecnicas asociadas al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No existe una categoria tecnica en la que encaje este repositorio, ya que no contiene un modelo. Cualquier comparacion con modelos reales (por ejemplo, LLM open source de 7B a 70B) seria artificial y enganosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no puede descargarse, ejecutarse ni evaluarse.
- La model card promociona herramientas de generacion de imagenes sexuales no consentidas ("deepnude"), lo que puede constituir delito en Espana y en la Union Europea (por ejemplo, difusion de imagenes intimas sin consentimiento, art. 197.7 del Codigo Penal, y obligaciones del Reglamento de IA y de la DSA sobre contenidos ilicitos).
- La licencia Apache 2.0 declarada en metadatos no otorga derechos sobre contenidos de terceros enlazados ni legitima el uso descrito en la propia model card.
- Riesgo de phishing y malware: los enlaces promocionales de este tipo de repositorios suelen dirigir a sitios que distribuyen software no verificado.
- Riesgo reputacional y de cumplimiento para cualquier organizacion que referencie el repositorio en su documentacion o dependencias.
- No hay idiomas, sesgos ni alucinaciones evaluables porque no hay modelo; el "sesgo" relevante es el proposito declarado del contenido.
- Recomendacion: reportar el repositorio a Hugging Face mediante el canal de abuso y no descargar ningun artefacto asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tuoyi-ai/top-ai-tuoyi-apps
- Canal de reporte de abuso de Hugging Face: https://huggingface.co/contact
- Codigo Penal espanol, art. 197.7 (difusion de imagenes intimas sin consentimiento): https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444
- Reglamento (UE) 2024/1689 de Inteligencia Artificial: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Reglamento (UE) 2022/2065 de Servicios Digitales: https://eur-lex.europa.eu/eli/reg/2022/2065/oj
