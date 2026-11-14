# will-taggart/Emotional-Atlas

## Resumen

Emotional Atlas no es un modelo de lenguaje, sino un repositorio de documentación alojado en Hugging Face por William Taggart (Virginia Tech, Department of Modern and Classical Languages and Literatures). Según la propia model card, el repositorio actúa como espejo del informe técnico del proyecto y no contiene pesos, checkpoints ni una aplicación ejecutable. La distribución real de software y materiales asociados se encuentra en un repositorio externo de GitHub.

El repositorio está etiquetado como `documentation` y `research`, con un tamaño de 0.0 GB, lo que confirma que no aloja artefactos de modelo. La información disponible se limita a metadatos de Hugging Face y a la model card, que enlaza a un PDF, un fichero LaTeX y una versión en Markdown del paper técnico. No se especifican arquitectura, parámetros, contexto, licencia ni idiomas.

Por tanto, esta ficha documenta un artefacto de investigación académica y no un modelo desplegable. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware carece de sentido con los datos disponibles, y se indica explícitamente como "no disponible" en cada apartado correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de documentación, 0.0 GB) |

## Arquitectura y entrenamiento

No disponible. El repositorio `will-taggart/Emotional-Atlas` es, según su propia model card, un espejo del informe técnico del proyecto y no un checkpoint ni una build de aplicación. No se describe arquitectura de red, composición del dataset, número de tokens de entrenamiento ni técnicas de alineación (RLHF, DPO u otras).

La única información técnica verificable es la existencia de un paper con versiones en PDF, LaTeX y Markdown dentro del directorio `docs/acm/`, junto con figuras y fuentes. El contenido de dicho paper no forma parte de la información proporcionada, por lo que no se puede detallar su metodología.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).
- El artefacto es documentación de investigación; su función es alojar el informe técnico y enlazar a la distribución del proyecto.

## Casos de uso

- Consulta del informe técnico: el repositorio sirve para acceder al paper en PDF, LaTeX y Markdown desde `docs/acm/`, útil para revisión académica o citación.
- Replicación de investigación: los enlaces a figuras y fuentes permiten a otros investigadores examinar los materiales del estudio.
- Referencia bibliográfica: el repositorio puede citarse como espejo del informe técnico asociado al proyecto Emotional Atlas.
- Localización del software: la model card redirige al repositorio de GitHub del proyecto para obtener el software y materiales relacionados.
- Archivo y preservación: al estar alojado en Hugging Face, el repositorio actúa como copia estable de la documentación con fecha de creación y actualización registradas.
- Difusión académica: el enlace directo al PDF y al LaTeX facilita compartir el trabajo en contextos de investigación en lenguas modernas y clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No se identifican modelos comparables en la información proporcionada, y el artefacto no es un modelo de lenguaje sino un repositorio de documentación.

## Limitaciones y advertencias

- El repositorio no contiene un modelo ejecutable: no se puede descargar, cuantizar ni servir mediante herramientas de inferencia.
- No se especifica licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- No se declaran idiomas soportados ni sesgos conocidos, al no tratarse de un modelo.
- El contenido técnico sustantivo reside en el paper enlazado (`docs/acm/`), no en la model card; la ficha no puede validar sus afirmaciones sin acceso a dicho documento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción.
- La fecha de creación registrada (2026-11-14) debe tratarse con cautela como metadato de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/will-taggart/Emotional-Atlas
- Distribución del proyecto en GitHub: https://github.com/FL2744/Emotional-Atlas
- Paper técnico (PDF): docs/acm/Emotional-Atlas.pdf (relativo al repositorio)
- Paper técnico (LaTeX): docs/acm/main.tex (relativo al repositorio)
- Paper técnico (Markdown): docs/acm/TECHNICAL_PAPER.md (relativo al repositorio)
- Figuras y fuentes: docs/acm/ (relativo al repositorio)
